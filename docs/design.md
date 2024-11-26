---
title: Design
layout: default
nav_order: 7
---
# Design

## Context
* *Orders (Core domain)*: context concerning the management of an order. 
They are made by the customer using a web application and they are received by the employees using a PC software.
This context contains everything related to the orders that allows to memorize them, manage their state and properly send the emails to the customer
* *Menu (Generic domain)*: context concerning the management of the menu. 
This context contains everything related to the menu from the choice of the menu items to what it’s displayed to the customer
* *Warehouse (Generic domain)*: context concerning the management of the warehouse. 
This context contains everything related to the warehouse from the choice of the ingredients to the restock

### Context Map
We chose to use *customer-supplier pattern* in order to design our context map because it suits our scenario where the implementation of all the api it's up to us permitting more collaboration. Also, it's easy to determine which context provides functionalities (upstream) and which ones need them (downstream) so it helps to maximize the integration among their models. 

<img src="resources/images/Context%20Map.png" width="400">

## Bounded Context Canvas
### Orders Context
**Description**: Management of the customers orders comprehensive of the list of items the customer would like to purchase, the type of the order, the state of the order and the customer contact  
  
**Business Decision**:
* An order must contain at least one item to be sent
* A customer can order only available items and in the available quantity
* The type of order must be always specified
* The customer email must be always specified into the order  

**Inbound Communications**:
* Send new order *(Customer application → a command)*
* Change order status *(Employee application → an event)*
* Manage ready order event *(Orders context → an event)*
* Show all orders *(Employee application → a query)*  

**Outbound Communications**:
* Decrease ingredients quantity *(an command → Warehouse context)*
* Ask available ingredients *(an query → Warehouse context)*
* Ask items *(an query → Menu context)*
* New order created notification *(an event → Employee application)*

### Menu Context
**Description**: Management of the list of items that are part of the menu and their recipe

**Business Decision**:
* The customer must see just the available items
* An item is not available if the quantity of one of its ingredient in the warehouse is not enough
* The quantity of all the ingredients of a recipe must be higher than zero

**Inbound Communications**:
* Show all items *(Manager application → a query)*
* Show all available items *(Order context → a command)*
* Add/modify an item *(Manager application → a command)*
* Show all available items *(Customer application → a command)*

**Outbound Communications**:
* Ask available ingredients *(an query → Warehouse context)*

### Warehouse Context
**Description**: Management of the list of ingredients stored in the warehouse of the cafe

**Business Decision**:
* Each ingredient have its own quantity
* The quantity of an ingredient can’t be minor of zero

**Inbound Communications**:
* Update ingredients *(Order context → an event)*
* Show all ingredients *(Manager application → a query)*
* Add an ingredient *(Manager application → a command)*
* Restock an ingredient *(Manager application → a command)*

**Outbound Communications**:
* Missing ingredient notification *(an event → Manager application)*








