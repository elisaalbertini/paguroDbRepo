rootProject.name = "DistributedCafe"

include("WarehouseService")

plugins {
    id("org.danilopianini.gradle-pre-commit-git-hooks") version "1.0.23"
}

gitHooks {
    commitMsg {
        conventionalCommits()
    }
    createHooks(true)
}