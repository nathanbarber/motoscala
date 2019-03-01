USE motoscala;
DROP TABLE IF EXISTS users; 
DROP TABLE IF EXISTS logs; 
DROP TABLE IF EXISTS hash;
CREATE TABLE users (
    username varchar(20) NOT NULL,
    email varchar(40),
    password varchar(100) NOT NULL,
    telephone varchar(10),
    token varchar(100),
    logs JSON,
    validated BOOLEAN default 0,
    PRIMARY KEY (username)
); 
CREATE TABLE logs (
    id varchar(100) NOT NULL,
    log JSON,
    PRIMARY KEY (id)
); 
CREATE TABLE hash (
    username varchar(20) primary key,
    hash varchar(100) default ''
); 