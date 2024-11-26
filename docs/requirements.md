---
title: Requirements
layout: default
nav_order: 3
---

# Requirements

## Client Interview
In the following section it’s reported the first interview with the client.  
*“I’m the owner of a cafe and I’m quite interested in introducing new technologies to help my activity to modernize since my customers and my employees are generally really young. 
My idea is to have three different softwares to use: I was thinking about a web application for the customers, that will allow them to make orders, a software for our PC, that the waiters and the kitchen staff can use, and a web application for our managers to help them manage the inventory and the menu of the cafe. 
I had this idea because we manage everything on paper and it starts to be quite complicated. 
The menu changes quite frequently because we always come up with new ideas and when an item runs out my waiters have to remember it because there is no way to indicate it on the old paper menus. Also, I want to avoid long queues for take away and too many phone calls to make home delivery orders. All the orders will be made by the application and when they are ready the system will notify the customer using the email he left at the moment of the order.
Paper orders go missing quite frequently and sometimes they are made twice. I want to avoid that, too.
Also the inventory is quite complicated to do manually, so some kind of database would be fantastic.
In the first version of this project there is no need to implement any payment system.
I’d like something quite simple and usable, we are not a fancy cafe!”*

## Functional requirements

* Web app for customers:
  * (Menu)
    * list available menu items
    * add an item in the order recap
  * (Orders)
    * modify the order
    * choose the type of order (from the table, take-away, home delivery)
    * send the order
    * receive emails from the system
* Software for employees:
  * (Orders management)
    * show recap of the different orders in real time
    * change the status of the order
* Web app for manager:
  * (Warehouse management)
    * manage ingredients and their quantity
    * restock missing ingredients
    * keep some ingredients information
  * (Menu management)
    * manage items and their recipe
    * keep some items information
  * (Notifications)
    * receive missing ingredients notifications

## Non-functional requirements
Each component of the back-end must run correctly on Linux and Windows and they must support Java Runtime Environment version 17 and Node.js version 20.

## Architectural requirements
* Back-end is composed by three microservices and a server (each microservice has its own database):
  * One microservice concerns the orders
  * One microservice concerns the menu
  * One microservice concerns the warehouse
  * The server interacts behind the scenes with microservices using a WebSocket connection

* Front-end is composed by three application 
  * implement a Java application (for the employees)
  * implement an Angular application (for the customers)
  * implement an Angular application (for the managers)

The front-end applications communicate only with the back-end server via *Web Socket* while the server communicates with the microservices via REST API.

## Implementation requirements
* The *customer web application* it’s developed using Angular framework
* The *manager web application* it’s developed using Angular framework
* The *employee software* it’s developed in Java
* The *server* that communicates with the front-ends by a websocket connection and with the microservices by their APi it’s developed using Express.js framework
* The *order microservice* and the *menu microservice* are developed using Express.js framework
* The *warehouse microservice* is developed using Vert.x and Kotlin