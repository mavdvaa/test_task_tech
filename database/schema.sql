CREATE TABLE companies (

    id TEXT PRIMARY KEY,

    name TEXT NOT NULL,

    category TEXT,

    city TEXT,

    address TEXT,

    rating NUMERIC,

    reviews_count INTEGER,

    site TEXT,

    phone TEXT

);

CREATE INDEX idx_category
ON companies(category);

CREATE INDEX idx_city
ON companies(city);

CREATE INDEX idx_reviews
ON companies(reviews_count);


CREATE TABLE review_import (
    id TEXT,
    name TEXT,
    category TEXT,
    city TEXT,
    address TEXT,
    rating TEXT,
    reviews_count TEXT,
    site TEXT,
    phone TEXT
);