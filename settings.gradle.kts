rootProject.name = "DistributedCafe"

include("WarehouseService")
include("EmployeeApplication")

plugins {
    id("org.danilopianini.gradle-pre-commit-git-hooks") version "1.0.23"
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.8.0"
}

gitHooks {
    commitMsg {
        conventionalCommits()
    }
    createHooks(true)
}
