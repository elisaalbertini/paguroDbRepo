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
    }
}