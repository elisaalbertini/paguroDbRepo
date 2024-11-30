var config = require('semantic-release-preconfigured-conventional-commits');
config.plugins.push(
  "@semantic-release/git",
  ["@semantic-release/github", 
    {"assets": 
      ["WarehouseService/build/output/WarehouseService.jar", 
        "EmployeeApplication/build/output/EmployeeApplication.jar"],
  }],
)
module.exports = config