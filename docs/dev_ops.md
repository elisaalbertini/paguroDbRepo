---
title: DevOps
layout: default
nav_order: 8
---
# DevOps

## Workflow organization
We chose to use git, and github in particular, to version our project.  
### Branch management
* **Branch "main"**: branch where the final version of the code is stored. The semantic release starts when the code is pushed here.
* **Branch "develop"**: branch that stores the code during the development of a new version of the project. Each new feature, fix, refactoring process etc. is developed in its own branch made from develop.
* **Branch "report"**: branch where all the documentation is stored. It contains the report published in the github pages and also the documentation of the code automatically generated.

#### Branch protection rules
We decided to use branch protections rules in *main* and *develop* branches.  
In order to push there is required to make a *pull request* from another branch. It is necessary that all the commits made in the new branch are signed and that one of the owner of the repository makes a review of the new code. It is also required *status checks*, implemented with github actions, to pass before merging.

### Commits
We followed the good practice of signing our commits and we also required everybody doing a pull request to do so, otherwise the pull request will be rejected automatically.  

In addiction, we used also conventional commits to enable semantic release based on them. We check their correct usage thanks to Gradle plugin applied as pre commits git hooks.

### API documentation
Since the app development required the web socket documentation and the server development required the API documentation, we used *Swagger* to publish both of the docs in order to have an easy way to consult them.

The API documentation is available here: [Documentation](./docs/documentation.md).

## Build automation
### Multiproject structure
The project contains subprojects running on different platforms (JVM and NodeJs). All the JVM subprojects are managed with *Gradle* while the others are managed with *npm*.

### Gradle
The Gradle version chosen for the project is 8.7.  
The main project has a general configuration valid for all the subproject using it but they also have their on build file.
In order to collect and bundle dependencies we organized them with a catalog.

We defined a custom task to generate the shadowJar of the components using the JVM. To achieve this, we used a Gradle plugin called *[com.gradleup.shadow](https://plugins.gradle.org/plugin/com.gradleup.shadow)*. This plugin allows the generation of an executable JAR by allowing you to configure the main class of the project, the name of the JAR, and the destination directory.

### Npm
Each subproject uses npm to manage useful scripts and project information. 
Thanks to it we managed also the production and development dependencies. In fact, the package manager allows to specify in which group the libraries must stay
This, combined with the build script, allows to generate a clear development/production version of the project. 

### webpack
To generate the production version of the Node.js back-ends we used *Webpack* which is a npm package for transforming, bundling, or packaging resources or assets.

## Code quality control
### Code formatting
Each component of the project has a specific formatting tool to format and check the code.  
We used *Spotless* to manage the formatting with Gradle, and in particular we used *Ktlint* for the Kotlin code and *Google Java Format* with *aosp* style for the Java code.  
As for Typescript code we used *typescript-formatter*, an *npm* package.

### Code quality and security
In order to check code quality and security we decide to use a Gradle plugin called *SonarCloud* which is a cloud-based service that provides code analysis. Thanks to the Gradle properties we set up the tool in a way it analyzes all the subprojects and we specified different parameters such as which files need to be included in the coverage analysis.
It also highlights code duplication, possible issues and security hotspots in the code. Developers have to follow the hints given by tool.  
To pass successfully an analysis the coverage must be &ge; 80% and the code duplication must be &le; 3%.

### Coverage
To generate the coverage report for each back-end component we used *JaCoCo* and *Jest*.

## CI

### github action

#### Reusable actions
We decided to create two reusable actions for the repeated ones. One is meant to start the tests of *server* and one is meant to initialize the actions when a component needs to be tested.

#### Testing
Each backend component has a workflow that runs their Unit tests and Jest tests. It uses a github action called *[mongodb-github-action](https://github.com/supercharge/mongodb-github-action)* to create the db.    
In order to test the server we start all the microservices and the server.
This workflows are used inside the main workflow for pull requests.

#### Documentation
There is a specific workflow that generate and deploy documentation each time a push is made on the *develop* and *main* branch.  
It's been used:
* *Typedoc* to generate documentation for TypeScript
* *Dokka* to generate documentation for Kotlin
* *Javadoc* to generate documentation for Java  

In order to publish all the documentation at once, the task merge all of them together and deploy it in the *report* branch thank to a github action called *[github-pages-deploy-action](https://github.com/JamesIves/github-pages-deploy-action)*.

The code documentation is available here: [Documentation](./docs/documentation.md).

#### Code formatting
When a new pull request is created, it triggers tasks to check the code formatting. If any checker finds improperly formatted code, the action fails.

#### SonarCloud
SonarCloud analysis is triggered when a push or a pull request is made on *develop* or *main* branch. It generates the coverage report for all the back-end components and merges the *Jest* ones, thanks to a npm package called *[nyc](https://www.npmjs.com/package/nyc)*, in order to generate an unified *lcov* report.
Additionally, SonarCloud provides a *github app* which enables an inline report of the pull request analysis.

#### Pull request template
We decided to add template for pull requests to follow that is useful for the team and other developer, since our project is distributed under a MIT license.

## CD
//TODO 

### Github pages
Our GitHub Pages site is currently being built from the */docs* folder in the *report* branch. It publishes the documentation of our project, composed by the code documentation and the project report.
