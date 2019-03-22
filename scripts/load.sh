#!/bin/bash

source ./.env

npm install

if [[ `pwd` == *"Motoscala"* && `ls schema` == *"update.sql"* ]]; then
    read -p "Database schema update required... proceed? (yes/no) >> " update_schema
    if [[ $update_schema == *"yes"* ]]; then
        mysql -u root -p -e "`cat ./schema/update.sql`";
    fi
fi

forever start ./index.js
forever list

echo "Application init load finished"