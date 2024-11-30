var config = require('semantic-release-preconfigured-conventional-commits');
config.plugins.push(
  "@semantic-release/git",
  ["@semantic-release/github", {"assets": ["WarehouseService/build/output/WarehouseService.jar"],
  "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"}],
)
module.exports = config

//"WarehouseService/build/output/WarehouseService.jar"