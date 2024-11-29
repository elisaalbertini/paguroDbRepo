var config = require('semantic-release-preconfigured-conventional-commits');
config.plugins.push(
  ["@semantic-release/git", {"assets": ["CHANGELOG.md"]}],
  ["@semantic-release/github", {"assets": [],
  "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"}],
//["@semantic-release/git", {
  //"assets": ["dist/**/*.{js,css}", "docs", "package.json"],
  //"message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
//}]
)
module.exports = config

//"WarehouseService/build/output/WarehouseService.jar"