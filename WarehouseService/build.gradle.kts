plugins {
    alias(libs.plugins.dokka)
    alias(libs.plugins.serialization)
    id("jacoco")
}

jacoco {
    toolVersion = libs.versions.jacoco.get()
}

dependencies {
    testImplementation(libs.bundles.kotlin.testing)
    testImplementation(libs.bundles.cucumber.testing)
    testImplementation(libs.junit.vintage)
    implementation(libs.bundles.vertx)
    implementation(libs.mongodb.driver)
    implementation(libs.bundles.kotlinx)
    implementation(libs.logback)
}

tasks.test {
    useJUnitPlatform()
    finalizedBy(tasks.jacocoTestReport)
    jvmArgs("--add-opens=java.base/java.util=ALL-UNNAMED")
    jvmArgs("--add-opens=java.base/java.lang=ALL-UNNAMED")
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required.set(true)
        csv.required.set(true)
    }
}

application {
    mainClass.set("server.Main")
}
