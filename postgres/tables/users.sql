CREATE TABLE users (
  id      SERIAL PRIMARY KEY,
  name    VARCHAR(100),
  email   TEXT UNIQUE NOT NULL,
  entries BIGINT DEFAULT 0,
  joined  TIMESTAMP   NOT NULL
);