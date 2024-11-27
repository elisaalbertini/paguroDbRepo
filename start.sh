#!/bin/bash
./gradlew shadowJar

docker-compose up -d

java -jar ./EmployeeApplication/build/output/EmployeeApplication.jar &