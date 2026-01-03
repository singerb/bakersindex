-- Create "formulas" table
CREATE TABLE "formulas" (
  "id" bigserial NOT NULL,
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  "deleted_at" timestamptz NULL,
  "name" text NULL,
  "user" text NULL,
  PRIMARY KEY ("id")
);
-- Create index "idx_formulas_deleted_at" to table: "formulas"
CREATE INDEX "idx_formulas_deleted_at" ON "formulas" ("deleted_at");
-- Create index "idx_formulas_user" to table: "formulas"
CREATE INDEX "idx_formulas_user" ON "formulas" ("user");
-- Create "formula_parts" table
CREATE TABLE "formula_parts" (
  "id" bigserial NOT NULL,
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  "deleted_at" timestamptz NULL,
  "ingredient" text NULL,
  "percent" numeric NULL,
  "is_base" boolean NULL,
  "formula_id" bigint NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_formulas_parts" FOREIGN KEY ("formula_id") REFERENCES "formulas" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create index "idx_formula_parts_deleted_at" to table: "formula_parts"
CREATE INDEX "idx_formula_parts_deleted_at" ON "formula_parts" ("deleted_at");
