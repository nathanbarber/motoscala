DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS logs;

CREATE TABLE users(
    username VARCHAR(20) PRIMARY KEY NOT NULL,
    email VARCHAR(40),
    password VARCHAR(100) NOT NULL,
    telephone VARCHAR(10),
    token VARCHAR(100),
    logs JSON
);

CREATE TABLE logs(
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    log JSON
);