#!/bin/bash

source ./.env

npm install

if [[ `pwd` == *"Motoscala"* && `ls schema` == *"update.sql"* ]]; then
    read -p "Database schema update required... proceed? (yes/no) >> " update_schema
    if [[ $update_schema == *"yes"* ]]; then
        mysql -u root -p -e "`cat ./schema/update.sql`";
        read -p "Remove update script to avoid repeated prompt on init? (yes/no) >> " $rm_update
        if [[ $update_schema == *"yes"* ]]; then
            rm schema/update.sql
        fi
    fi
fi

echo "Application init load finished"