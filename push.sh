#!/bin/bash

source ./.env

# Create package
mkdir Motoscala-Dist

cp -r dist Motoscala-Dist
cp -r src Motoscala-Dist
cp index.js Motoscala-Dist
cp icon.png Motoscala-Dist
cp load.sh Motoscala-Dist
cp *.json Motoscala-Dist
cp .env Motoscala-Dist

zip -r Motoscala-Dist.zip Motoscala-Dist
rm -r Motoscala-Dist

echo "Uploading to $HOST_EC2"

read -p "Enter your EC2 username >> " user
scp ./Motoscala-Dist.zip $user@$HOST_EC2:~/

echo "Success!"
rm ./Motoscala-Dist.zip

read -p "Continue load process on EC2? (yes/no)" signin_ec2

if [[ $signin_ec2 == *"yes"* ]]; then
    ssh $user@$HOST_EC2
else
    echo "Okay, staying local. Log in later with 'ssh $user@$HOST_EC2'"
fi