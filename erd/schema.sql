CREATE TABLE User (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    imageUrl VARCHAR(100),
    password VARCHAR(100) NOT NULL,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAT 
);

CREATE TABLE Product (
    id SERIAL PRIMARY KEY,
    productName VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    price INT NOT NULL,
    tags NOT NULL,
    imageUrl VARCHAR(100),
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAT 
);

CREATE TABLE Article (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content ARCHAR(500) NOT NULL,
    imageUrl VARCHAR(100),
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAT 
);

CREATE TABLE Comment (
    id SERIAL PRIMARY KEY,
    content VARCHAR(500) NOT NULL,
    type type NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAT 
);

CREATE TABLE ProductLike (
    id SERIAL PRIMARY KEY,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAT 
);

CREATE TABLE ArticleLike (
    id SERIAL PRIMARY KEY,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAT 
);