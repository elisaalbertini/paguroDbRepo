var publishCmd = `
./gradlew assemble -Pversion=\${nextRelease.version} --parallel || exit 1
./gradlew createJavadoc -Pversion=\${nextRelease.version} || exit 2
git tag -a -f \${nextRelease.version} \${nextRelease.version} -F CHANGELOG.md || exit 3
git push --force origin \${nextRelease.version} || exit 4
echo ::set-output name=nextVer::\${nextRelease.version} || exit 5
`
var config = require('semantic-release-preconfigured-conventional-commits');
config.plugins.push(
    ["@semantic-release/exec", {
        "publishCmd": publishCmd,
    }],
    ["@semantic-release/github", {
        "assets": [ ]
    }],
    "@semantic-release/git",
)
config.branches = ['main']

module.exports = config