var config = require('semantic-release-preconfigured-conventional-commits');
config.plugins.push(
["@semantic-release/github", {"assets": ["WarehouseService/build/output/WarehouseService.jar"]}],
"@semantic-release/git"
//["@semantic-release/git", {
  //"assets": ["dist/**/*.{js,css}", "docs", "package.json"],
  //"message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
//}]
)
module.exports = config
