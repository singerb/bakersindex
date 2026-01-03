package main

import (
    "fmt"
    "io"
    "os"

    "ariga.io/atlas-provider-gorm/gormschema"

    "bi-backend/lib"
)

func main() {
    stmts, err := gormschema.New("postgres").Load(
		&lib.Formula{},
		&lib.FormulaPart{},
	)
    if err != nil {
        fmt.Fprintf(os.Stderr, "failed to load gorm schema: %v\n", err)
        os.Exit(1)
    }
    io.WriteString(os.Stdout, stmts)
}
