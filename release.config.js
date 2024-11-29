var config = require('semantic-release-preconfigured-conventional-commits');
config.plugins.push(
     "@semantic-release/git",
     ["@semantic-release/github", {
      "assets": ["package.json"]
  }]
)
config.branches = ['main']
module.exports = config
