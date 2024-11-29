var config = require('semantic-release-preconfigured-conventional-commits');
config.plugins.push(
["@semantic-release/git", {"assets": []}],
["@semantic-release/github", {"assets": []}],
)
module.exports = config
