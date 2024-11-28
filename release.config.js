var config = require('semantic-release-preconfigured-conventional-commits');
config.plugins.push(
    "@semantic-release/github",
     "@semantic-release/git",
     ["@semantic-release/github", {
      "assets": ["./WarehouseService/build/output/WarehouseService.jar"]
  }]
)
module.exports = config
