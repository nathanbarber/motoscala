#!/bin/bash

source .env

export PORT="8000"
export VALIDATE_HOST="https://www.motoscala.com"
export FSTORE="/home/nathanbarber/store/_motoscala"

forever start index.js
forever list