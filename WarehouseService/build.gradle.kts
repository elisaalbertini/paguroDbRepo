plugins {
    alias(libs.plugins.kotlin)
    alias(libs.plugins.dokka)
    alias(libs.plugins.ktlint)
    alias(libs.plugins.serialization)
    id("jacoco")
}

jacoco {
    toolVersion = libs.versions.jacoco.get()
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(libs.bundles.kotlin.testing)
    testImplementation(libs.bundles.cucumber.testing)
    testImplementation(libs.junit.vintage)
    implementation(libs.bundles.vertx)
    implementation(libs.mongodb.driver)
    implementation(libs.bundles.kotlinx)
    implementation(kotlin("script-runtime"))
}

tasks.test {
    useJUnitPlatform()
    finalizedBy(tasks.jacocoTestReport)
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required.set(true)
        csv.required.set(true)
    }
}

ktlint {
    filter {
        include("**/main/kotlin/**/*.kt")
        exclude("**/*.gradle.kts")
    }
}

