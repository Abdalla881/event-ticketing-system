CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_status AS ENUM ('active', 'inactive');

CREATE TABLE users (
    id             UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
    email          CITEXT         NOT NULL UNIQUE,
    user_name      VARCHAR(100)   NOT NULL,
    password       VARCHAR(255),
    status         user_status    NOT NULL DEFAULT 'active',
    phone          VARCHAR(20),
    role           VARCHAR(50)    NOT NULL DEFAULT 'user',
    google_id      VARCHAR(255),
    provider       VARCHAR(50)    DEFAULT 'local',
    reset_code          VARCHAR(255),
    reset_code_expires  TIMESTAMPTZ,
    reset_code_verified BOOLEAN        DEFAULT FALSE,
    created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);


-- Trigger function to auto-update updated_at on row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();