#!/bin/bash
./gradlew EmployeeApplication:shadowJar

docker-compose up -d

java -jar ./EmployeeApplication/build/output/EmployeeApplication.jar &