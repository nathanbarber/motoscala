#!/bin/bash

source .env

export PORT="8080"
export VALIDATE_HOST="http://localhost:8080"
export FSTORE="./fstore"

gulp nodemon