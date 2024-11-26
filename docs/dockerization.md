---
title: Dockerization
layout: default
nav_order: 10
---

# Dockerization

## Images
### WarehouseService
We chose to start from an image with JDK 17 for the microservice relying on the JVM to run.  
We provide an environment variable with the address of the database container and then we expose the port.  
Lastly, we run the shadowJar of the microservice. 
### Node back-end components
We chose to start from an image with node 20, we prefer a light version, for the back-end components relying on Node to run.  
We have two stages using the same image: the first one builds the production version of the component using *webpack* while the second provides an environment variable with the address of the database container and exposes the container port. Lastly, it copies the built version of the project from the previous stage and runs it thanks to Node.  
As for the *server* component, in the *start* stage we provide also, as environment variables, the names of the containers of the microservices.
### Angular applications
We have two stages: the first one starts from an lighter image with node 20 and build the production version of the application.  
The second stage starts from the latest image of *nginx*. Lastly, it copies the built version of the project from the previous stage and exposes the container port.
### N.B.
For simplification, we didn't provide a docker image of the Java app *EmployeeApplication*.

## Docker compose
In the docker compose we have the following services:
* mongo
* server
* menu-service
* orders-service
* WarehouseService
* manager-application
* customer-application  
Each service has its local port mapped and it connects to a *bridge* network called *DistributedCafeNetwork*.  
Also, some of them have a list of the services they depend on and one or more volumes, depending on the starting image they use.

## Script
We provide a script called *start.sh* that generates the shadowJar of *EmployeeApplication* and starts it and also run the docker compose.