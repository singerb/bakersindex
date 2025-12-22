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

type FormulaPart struct {
	Model
	Ingredient string `json:"ingredient"`
	Percent float32 `json:"percent"`
	IsBase bool `json:"isBase"`
	FormulaID uint `json:"-"`
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

func CreateFormula(db *gorm.DB, userId string, formulaInput *Formula) (Formula, error) {
	formulaInput.User = userId

	ctx := context.Background()
	err := gorm.G[Formula](db).Create(ctx, formulaInput)

	return *formulaInput, err
}

func EditFormula(db *gorm.DB, userId string, formulaId uint, formulaInput *Formula) (Formula, error) {
	formulaInput.User = userId

	// do this in two steps so we delete any parts that got removed, as well as insert new ones
	existingPartIds := []uint{}
	for _, e := range formulaInput.Parts {
		if e.ID > 0 {
			// we only care about existing parts that have a real ID
			existingPartIds = append(existingPartIds, e.ID)
		}
	}

	// this clears out any removed parts
	err := db.Not(existingPartIds).Where(&FormulaPart{FormulaID: formulaId}).Delete(&FormulaPart{}).Error
	if err != nil {
		return *formulaInput, err
	}

	// this will insert any new parts
	err = db.Session(&gorm.Session{FullSaveAssociations: true}).Where(&Formula{Model: Model{ID: formulaId}, User: userId}).Updates(&formulaInput).Error

	return *formulaInput, err
}

func DeleteFormula(db *gorm.DB, userId string, formulaId uint) error {
	// do this delete with the traditional API to handle cleaning up the relations along with the formula
	err := db.Select("Parts").Where(&Formula{User: userId}).Delete(&Formula{Model: Model{ID: formulaId}}).Error

	return err
}
