var config = require('semantic-release-preconfigured-conventional-commits');
config.plugins.push(
["@semantic-release/git", {"assets": []}],
["@semantic-release/github", {"assets": ["WarehouseService/build/output/WarehouseService.jar"]}],
)
module.exports = config
