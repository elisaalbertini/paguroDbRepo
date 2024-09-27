---
title: Design
layout: default
nav_order: 6
---
# Design

## Context
// TODO introduction
* *Orders (Core domain)*: context concerning the management of an order. They are made by the customer using a web application and they are received by the employees using a PC software. This involves different orders and the cart
* *Menu (Generic domain)*: context concerning the management of the menu. Everything related to the menu from the choice of the menu items to what it’s displayed to the customer
* *Warehouse (Generic domain)*: context concerning the management of the warehouse. Everything related to the menu from the choice of the ingredients to the restock

### Context Map
// TODO introduction  
<img src="resources/images/Context%20Map.png" width="400">

## Bounded Context Canvas
### Orders Context
**Description**: Management of the customers orders comprehensive of the list of items the customer would like to purchase, the type of the order, the state of the order and the customer contact  

**Strategic classification**:
* **Domain**: Core
* **Business Model**: Engagement creator
* **Evolution**: Commodity  
  
**Business Decision**:
* An order must contain at least one item to be sent
* A customer can’t do two or more orders at the same time
* A customer can order only available items and in the available quantity
* The type of order must be always specified
* The customer email must be always specified into the order  

**Inbound Communications**:
* Add/modify/remove an item from the order  *(Customer application → a command)*
* Send new order *(Customer application → a command)*
* Change order status *(Employee application → an event)*
* Manage ready order *(Orders context → an event)*
* Show all orders *(Employee application → a query)*  

**Outbound Communications**:
* Create new order event *(an event → Warehouse context)*

### Menu Context
**Description**: Management of the list of items that are part of the menu and their recipe

**Strategic classification**:
* **Domain**: Generic
* **Business Model**: Engagement creator
* **Evolution**: Commodity  

**Business Decision**:
* The customer must see just the available items
* An item is not available if the quantity of one of its ingredient in the warehouse is not enough
* The recipe of an item must contain at least two ingredients
* The quantity of all the ingredients of a recipe must be higher than zero

**Inbound Communications**:
* Show all items *(Manager application → a query)*
* Show all available items *(Order context → a command)*
* Add/modify/remove an item *(Manager application → a command)*
* Update menu *(Warehouse context → an event)*
* Show all available items *(Customer application → a command)*

**Outbound Communications**:
* Show all available ingredients *(a command→ Warehouse context)*

### Warehouse Context
**Description**: Management of the list of ingredients stored in the warehouse of the cafe

**Strategic classification**:
* **Domain**: Generic
* **Business Model**: Engagement creator
* **Evolution**: Commodity  

**Business Decision**:
* Each ingredient have its own quantity
* The quantity of an ingredient can’t be minor of zero

**Inbound Communications**:
* Update ingredients *(Order context → an event)*
* Show all ingredients *(Manager application → a query)
* Add an ingredient *(Manager application → a command)*
* Restock an ingredient *(Manager application → a command)*

**Outbound Communications**:
* Create update warehouse event *(an event → Menu context)*








