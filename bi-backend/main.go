package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strconv"

	"bi-backend/lib"
	"bi-backend/middleware"

	"github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

type Status struct {
	Ok bool `json:"ok"`
}

func checkUser(w http.ResponseWriter, r *http.Request) (string, error) {
	claims, ok := r.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
	if !ok {
		http.Error(w, "failed to get validated claims", http.StatusInternalServerError)
		return "", errors.New("failed to get validated claims")
	}
	userId := claims.RegisteredClaims.Subject

	return userId, nil
}

func main() {
	lib.LoadEnv()
	db, err := lib.Connect()
	if err != nil {
		panic("failed to connect database")
	}

	audience := os.Getenv("AUTH0_AUDIENCE")
	domain := os.Getenv("AUTH0_DOMAIN")

	r := mux.NewRouter()

	r.HandleFunc("/formulas", middleware.ValidateJWT(audience, domain, func(w http.ResponseWriter, r *http.Request) {
		userId, err := checkUser(w, r)
		if err != nil {
			return
		}

		formulas, err := lib.GetFormulas(db, userId)

		if err != nil {
			http.Error(w, "failed to get formulas", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(formulas)
	})).Methods("GET")

	r.HandleFunc("/formula/{formulaId}", middleware.ValidateJWT(audience, domain, func(w http.ResponseWriter, r *http.Request) {
		userId, err := checkUser(w, r)
		if err != nil {
			return
		}

		vars := mux.Vars(r)
		formulaId, err := strconv.ParseUint(vars["formulaId"], 10, 0)
		if err != nil {
			http.Error(w, "failed to get formula id", http.StatusInternalServerError)
			return
		}
		formula, err := lib.GetFormula(db, userId, uint(formulaId))

		if err != nil {
			http.Error(w, "failed to get formula", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(formula)
	})).Methods("GET")

	r.HandleFunc("/formula/{formulaId}", middleware.ValidateJWT(audience, domain, func(w http.ResponseWriter, r *http.Request) {
		userId, err := checkUser(w, r)
		if err != nil {
			return
		}

		vars := mux.Vars(r)
		formulaId, err := strconv.ParseUint(vars["formulaId"], 10, 0)
		if err != nil {
			http.Error(w, "failed to get formula id", http.StatusInternalServerError)
			return
		}
		err = lib.DeleteFormula(db, userId, uint(formulaId))

		if err != nil {
			http.Error(w, "failed to delete formula", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(Status{Ok: true})
	})).Methods("DELETE")

	r.HandleFunc("/formula/{formulaId}", middleware.ValidateJWT(audience, domain, func(w http.ResponseWriter, r *http.Request) {
		userId, err := checkUser(w, r)
		if err != nil {
			return
		}

		vars := mux.Vars(r)
		formulaId, err := strconv.ParseUint(vars["formulaId"], 10, 0)
		if err != nil {
			http.Error(w, "failed to get formula id", http.StatusInternalServerError)
			return
		}

		var formula lib.Formula
		json.NewDecoder(r.Body).Decode(&formula)

		fullFormula, err := lib.EditFormula(db, userId, uint(formulaId), &formula)

		if err != nil {
			http.Error(w, "failed to edit formula", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(fullFormula)
	})).Methods("PUT")

	r.HandleFunc("/formula", middleware.ValidateJWT(audience, domain, func(w http.ResponseWriter, r *http.Request) {
		userId, err := checkUser(w, r)
		if err != nil {
			return
		}

		var formula lib.Formula
		json.NewDecoder(r.Body).Decode(&formula)

		fullFormula, err := lib.CreateFormula(db, userId, &formula)

		if err != nil {
			http.Error(w, "failed to create formula", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(fullFormula)
	})).Methods("POST")

	r.HandleFunc("/", middleware.NotFoundHandler)

	// TODO: better CORS headers
	corsWrap := handlers.CORS(handlers.AllowedOrigins([]string{"*"}), handlers.AllowedHeaders([]string{"Authorization", "Content-Type"}), handlers.AllowedMethods([]string{"GET", "POST", "DELETE", "PUT"}))(r)

	// log our requests
	logWrap := handlers.LoggingHandler(os.Stdout, corsWrap)

	http.ListenAndServe(":8080", logWrap)
}
