#!/bin/bash

source ./.env
npm install
forever start ./index.js