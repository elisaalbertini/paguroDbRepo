---
title: System architecture
layout: default
nav_order: 9
---

# System architecture

## Microservices architecture
The microservice is structured in layers:
* *Domain*: implementation of the domain entities according to DDD
* *Repository*: encapsulation of the access and management of the database according to DDD
* *Application*: encapsulation of the services and the business logic according to DDD
* *Handler*: management of http requests
* *API*: exposed by *routes* in menu-service and orders-service and exposed by *server* in WarehouseService

## Testing
Concerning **WarehouseService**, the structure of the test follows the structure of the microservice. We have JUnit tests for *Repository*, *Application* and *Server* and we have also *Cucumber* tests for the repository layer.  
For **menu-service** we test *routes* using *Jest*.  
For **orders-service** we test *repository* and *routes* using *Jest*

## Server architecture
Server is the component that maps the messages arriving from the front-end application, via *web socket*, to the APIs exposed by the microservices.  

For many APIs, once one of them has been called, the server simply waits for the response and sends it back.

In some cases, its job is to manage the interactions between the microservices for those functionalities that are implemented relying on more than one API calls. The server decides the order of the requests, waits for their responses and, based on the results, manages the next step dealing with errors if needed.
