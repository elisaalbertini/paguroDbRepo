var config = require('semantic-release-preconfigured-conventional-commits');
config.plugins.push(
    "@semantic-release/github",
     ["@semantic-release/git", {
      "assets": ["dist/**/*.{js,css}", "docs", "package.json"],
    }]
)
module.exports = config
