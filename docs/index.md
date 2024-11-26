---
title: Introduction
layout: home
has_children: false
nav_order: 1
---

# Introduction
This is the project report made for the course of **Software Process Engineering**.  
The goal of the project is to build a distributed system to manage different aspects of a *cafe* such as:
* Management of the warehouse
* Management of the menu
* Management of the orders (both for the customers and the employees)

## Project goal

The goal of our project is to:
* Front-end:
  * implement a Java application (for the employees)
  * implement an Angular application (for the customers)
  * implement an Angular application (for the managers)
* Back-end:
  * implement microservices exposing REST API
  * implement a WebSocket connection with a server that interacts behind the scenes with microservices

The system will:
* follow *Domain Driven Design* principles
* follow *DevOps* principles such as *Build Automation*, *CI* and *CD*
* implement *containerization* using Docker