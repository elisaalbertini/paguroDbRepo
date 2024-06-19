plugins {
    alias(libs.plugins.sonarqube)
}

repositories {
    mavenCentral()
}

sonar {
    properties {
        property("systemProp.sonar.projectKey")
        property("systemProp.sonar.organization")
        property("systemProp.sonar.host.url")
        property("systemProp.sonar.coverage.exclusions")
        property("systemProp.sonar.coverage.jacoco.xmlReportPaths")
        property("systemProp.sonar.exclusion")
    }
}