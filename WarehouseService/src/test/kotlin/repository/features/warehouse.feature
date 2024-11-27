Feature: Interacting with the warehouse

  Scenario Outline: Manager adds a new ingredient
    Given there are 99 units of milk and 4 units of tea in the warehouse
    When Manager adds an ingredient with name <name> and quantity <quantity>
    Then Manager receives <response> and message <message>
    Examples:
      |name     |quantity |response | message                          |
      |milk     |99       |400      | ERROR_INGREDIENT_ALREADY_EXISTS  |
      |butter   |-2       |400      | ERROR_WRONG_PARAMETERS            |
      |coffee   |5        |200      | OK                               |

  Scenario Outline: Manager wants to restock the <name> in the warehouse
    Given there are 99 units of milk and 4 units of tea in the warehouse
    When Manager restocks the <name> adding <quantity> units
    Then Manager receives <response> and message <message>
    Examples:
      |name   |quantity |response | message                    |
      |coffee |10       |404      | ERROR_INGREDIENT_NOT_FOUND |
      |butter |-2       |400      | ERROR_WRONG_PARAMETERS |
      |tea    |5        |200      | OK                         |

  Scenario Outline: System wants to decrease the <name> quantity in the warehouse
    Given there are 99 units of milk and 4 units of tea in the warehouse
    When System decreases the <name> quantity by <quantity>
    Then System receives <response> and message <message>
    Examples:
      |name   |quantity |response | message                    |
      |coffee |1        |404      | ERROR_INGREDIENT_NOT_FOUND |
      |tea    |4        |200      | OK                         |
      |milk   |100      |400      | ERROR_INGREDIENT_QUANTITY  |

  Scenario: Manager wants to check the list of ingredients in the warehouse
    Given there are 99 units of milk and 4 units of tea in the warehouse
    When Manager asks for the list of ingredients in the warehouse
    Then Manager receives 200 and message OK

  Scenario: Manager wants to check the list of ingredients in the warehouse
    Given there are no ingredients in the warehouse
    When Manager asks for the list of ingredients in the warehouse
    Then Manager receives 404 and message ERROR_EMPTY_WAREHOUSE

  Scenario: Manager wants to check the list of available ingredients in the warehouse
    Given there are 99 units of milk, 4 units of tea and 0 unit of coffee in the warehouse
    When Manager asks for the list of available ingredients in the warehouse
    Then Manager receives 200 and message OK

  Scenario: Manager wants to check the list of available ingredients in the warehouse
    Given there are no ingredients in the warehouse
    When Manager asks for the list of available ingredients in the warehouse
    Then Manager receives 404 and message ERROR_EMPTY_WAREHOUSE

