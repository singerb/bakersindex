package main

import (
	"bi-backend/lib"
)

func main() {
	lib.LoadEnv()
	db, err := lib.Connect()
	if err != nil {
		panic("failed to connect database")
	}

	lib.SetupDB(db)
}
