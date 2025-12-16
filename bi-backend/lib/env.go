package lib

import (
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	env := os.Getenv("BI_ENV")
	if "" == env {
		env = "development"
	}

	godotenv.Load(".env." + env)
	godotenv.Load() // The Original .env

	req := []string{ "DATABASE_URL" }
	for _, name := range req {
		val := os.Getenv(name)
		if val == "" {
			panic("Required environment variable " + name + " not found in env; BI_ENV is " + env)
		}
	}
}
