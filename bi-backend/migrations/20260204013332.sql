-- Create "formula_meta" table
CREATE TABLE "formula_meta" (
  "id" bigserial NOT NULL,
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  "deleted_at" timestamptz NULL,
  "type" text NULL,
  "value" text NULL,
  "formula_id" bigint NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_formulas_metas" FOREIGN KEY ("formula_id") REFERENCES "formulas" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create index "idx_formula_meta_deleted_at" to table: "formula_meta"
CREATE INDEX "idx_formula_meta_deleted_at" ON "formula_meta" ("deleted_at");
