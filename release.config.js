var config = require('semantic-release-preconfigured-conventional-commits');
config.plugins.push(
  ["@semantic-release/git", {"assets": ["start.sh"]}],
  ["@semantic-release/github", {"assets": ["WarehouseService/build/output/WarehouseService.jar"],
  "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"}],
//["@semantic-release/git", {
  //"assets": ["dist/**/*.{js,css}", "docs", "package.json"],
  //"message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
//}]
)
module.exports = config