plugins {
    id("java")
    id("com.github.sherter.google-java-format") version "0.9"
}

dependencies{
    implementation(libs.vertx.core)
}

googleJavaFormat {
    toolVersion = "1.1"
}

tasks.compileJava {
        mustRunAfter(tasks.verifyGoogleJavaFormat)
}

repositories {
    mavenCentral()
    mavenLocal()
}