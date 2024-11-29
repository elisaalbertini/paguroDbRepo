var config = require('semantic-release-preconfigured-conventional-commits');
config.plugins.push(
//["@semantic-release/git", {"assets": ["EmployeeApplication/build/output/EmployeeApplication.jar"]}],
["@semantic-release/github", {"assets": ["WarehouseService/build/output/WarehouseService.jar"]}],
"@semantic-release/git"
)
module.exports = config
