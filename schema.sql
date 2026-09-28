-- Practica 6 - Tabla de ejemplo en Cloudflare D1 (SQLite)
--
-- Se aplica con:
--   npx wrangler d1 execute practica6-db --remote --file=./schema.sql

DROP TABLE IF EXISTS libros;

CREATE TABLE libros (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT    NOT NULL,
  autor  TEXT    NOT NULL,
  anio   INTEGER NOT NULL
);

INSERT INTO libros (titulo, autor, anio) VALUES
  ('Cien años de soledad',       'Gabriel García Márquez', 1967),
  ('Pedro Páramo',               'Juan Rulfo',             1955),
  ('La región más transparente', 'Carlos Fuentes',         1958);
