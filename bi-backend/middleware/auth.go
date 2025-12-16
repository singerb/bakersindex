package middleware

import (
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"bi-backend/helpers"

	"github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/pkg/errors"
)

const (
	missingJWTErrorMessage = "Requires authentication"
	invalidJWTErrorMessage = "Bad credentials"
)

const (
	notFoundErrorMessage       = "Not Found"
	internalServerErrorMessage = "Internal Server Error"
)

type ErrorMessage struct {
	Message string `json:"message"`
}

func NotFoundHandler(rw http.ResponseWriter, req *http.Request) {
	errorMessage := ErrorMessage{Message: notFoundErrorMessage}
	err := helpers.WriteJSON(rw, http.StatusNotFound, errorMessage)
	if err != nil {
		ServerError(rw, err)
	}
}

func ServerError(rw http.ResponseWriter, err error) {
	errorMessage := ErrorMessage{Message: internalServerErrorMessage}
	werr := helpers.WriteJSON(rw, http.StatusInternalServerError, errorMessage)
	if werr != nil {
		log.Println("Error writing error message: ", werr.Error())
	}
	log.Print("Internal error server: ", err.Error())
}

func ValidateJWT(audience, domain string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		issuerURL, err := url.Parse("https://" + domain + "/")
		if err != nil {
			log.Fatalf("Failed to parse the issuer url: %v", err)
		}

		provider := jwks.NewCachingProvider(issuerURL, 5*time.Minute)

		jwtValidator, err := validator.New(
			provider.KeyFunc,
			validator.RS256,
			issuerURL.String(),
			[]string{audience},
		)
		if err != nil {
			log.Fatalf("Failed to set up the jwt validator")
		}

		if authHeaderParts := strings.Fields(r.Header.Get("Authorization")); len(authHeaderParts) > 0 && strings.ToLower(authHeaderParts[0]) != "bearer" {
			errorMessage := ErrorMessage{Message: invalidJWTErrorMessage}
			if err := helpers.WriteJSON(w, http.StatusUnauthorized, errorMessage); err != nil {
				log.Printf("Failed to write error message: %v", err)
			}
			return
		}

		errorHandler := func(w http.ResponseWriter, r *http.Request, err error) {
			log.Printf("Encountered error while validating JWT: %v", err)
			if errors.Is(err, jwtmiddleware.ErrJWTMissing) {
				errorMessage := ErrorMessage{Message: missingJWTErrorMessage}
				if err := helpers.WriteJSON(w, http.StatusUnauthorized, errorMessage); err != nil {
					log.Printf("Failed to write error message: %v", err)
				}
				return
			}
			if errors.Is(err, jwtmiddleware.ErrJWTInvalid) {
				errorMessage := ErrorMessage{Message: invalidJWTErrorMessage}
				if err := helpers.WriteJSON(w, http.StatusUnauthorized, errorMessage); err != nil {
					log.Printf("Failed to write error message: %v", err)
				}
				return
			}
			ServerError(w, err)
		}

		middleware := jwtmiddleware.New(
			jwtValidator.ValidateToken,
			jwtmiddleware.WithErrorHandler(errorHandler),
		)

		middleware.CheckJWT(next).ServeHTTP(w, r)
	}
}
