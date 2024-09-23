plugins {
    id("java")
    alias(libs.plugins.spotless)
    alias(libs.plugins.johnrengelman.shadow)
    id("application")
}

spotless {
    java {
        googleJavaFormat(libs.versions.google.get())
        formatAnnotations()
    }
}

application {
    mainClass.set("application.Main")
}

tasks.withType<com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar> {
    mergeServiceFiles()
    manifest.attributes["Main-Class"] = application.mainClass
    archiveFileName.set("${project.name}.jar")
    destinationDirectory.set(file("${layout.buildDirectory.get()}/output"))
}

dependencies{
    implementation(libs.vertx.core)
    implementation(libs.jackson)
}

repositories {
    mavenCentral()
    mavenLocal()
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(17))
    }
}