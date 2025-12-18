package lib

import (
	"context"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Model struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Formula struct {
	Model
	Name string `json:"name"`
	User string `json:"user" gorm:"index"`
	Parts []FormulaPart `json:"parts"`
}

type FormulaInput struct {
	Name string `json:"name"`
	Parts []PartInput `json:"parts"`
}

type FormulaPart struct {
	Model
	Ingredient string `json:"ingredient"`
	Percent float32 `json:"percent"`
	IsBase bool `json:"isBase"`
	FormulaID uint `json:"-"`
}

type PartInput struct {
	Ingredient string `json:"ingredient"`
	Percent uint `json:"percent"`
	IsBase bool `json:"isBase"`
}

func Connect() (*gorm.DB, error) {
	connStr := os.Getenv("DATABASE_URL")
	db, err := gorm.Open(postgres.Open(connStr), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	return db, err
}

func SetupDB(db *gorm.DB) error {
	ctx := context.Background()

	// Clean up old tables
	result := gorm.WithResult()
	err := gorm.G[any](db, result).Exec(context.Background(), "DROP TABLE formulas")
	err = gorm.G[any](db, result).Exec(context.Background(), "DROP TABLE formula_parts")

	// Migrate the schema
	// TODO: introduce a version concept
	db.AutoMigrate(&Formula{}, &FormulaPart{})

	// Create
	formula := Formula{Name: "Basic Sourdough", User: "auth0|693498138ccef11815d504df", Parts: []FormulaPart{{Ingredient: "Flour", Percent: 100.0, IsBase: true}, {Ingredient: "Water", Percent: 75.0, IsBase: false}}}
	err = gorm.G[Formula](db).Create(ctx, &formula)
	formula = Formula{Name: "Another Sourdough", User: "fakeuser"}
	err = gorm.G[Formula](db).Create(ctx, &formula)

	return err
}

func GetFormulas(db *gorm.DB, userId string) ([]Formula, error) {
	ctx := context.Background()
	formulas, err := gorm.G[Formula](db).Where(&Formula{User: userId}).Find(ctx)

	return formulas, err
}

func GetFormula(db *gorm.DB, userId string, formulaId uint) (Formula, error) {
	ctx := context.Background()
	formula, err := gorm.G[Formula](db).Preload("Parts", nil).Where(&Formula{Model: Model{ID: formulaId}, User: userId}).First(ctx)

	return formula, err
}

func CreateFormula(db *gorm.DB, userId string, formulaInput *FormulaInput) (Formula, error) {
	var formula Formula
	formula.Name = formulaInput.Name
	formula.User = userId
	formula.Parts = []FormulaPart{}

	ctx := context.Background()
	err := gorm.G[Formula](db).Create(ctx, &formula)

	return formula, err
}

func DeleteFormula(db *gorm.DB, userId string, formulaId uint) error {
	ctx := context.Background()
	_, err := gorm.G[Formula](db).Where(&Formula{Model: Model{ID: formulaId}, User: userId}).Delete(ctx)

	return err
}
