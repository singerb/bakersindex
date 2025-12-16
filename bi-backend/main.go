package main

import (
	"encoding/json"
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
		claims, ok := r.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		if !ok {
			http.Error(w, "failed to get validated claims", http.StatusInternalServerError)
			return
		}
		userId := claims.RegisteredClaims.Subject

		formulas, err := lib.GetFormulas(db, userId)

		if err != nil {
			http.Error(w, "failed to get formulas", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(formulas)
	})).Methods("GET")

	r.HandleFunc("/formula/{formulaId}", middleware.ValidateJWT(audience, domain, func(w http.ResponseWriter, r *http.Request) {
		claims, ok := r.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
		if !ok {
			http.Error(w, "failed to get validated claims", http.StatusInternalServerError)
			return
		}
		userId := claims.RegisteredClaims.Subject

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

	r.HandleFunc("/", middleware.NotFoundHandler);

	// TODO: better CORS headers
	http.ListenAndServe(":8080", handlers.CORS(handlers.AllowedOrigins([]string{"*"}), handlers.AllowedHeaders([]string{"Authorization"}))(r))
}
