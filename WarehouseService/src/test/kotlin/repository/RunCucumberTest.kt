package repository

import io.cucumber.junit.Cucumber
import io.cucumber.junit.CucumberOptions
import org.junit.runner.RunWith

/**
 * Class that runs cucumber tests
 */
@RunWith(Cucumber::class)
@CucumberOptions(
    features = ["src/test/kotlin/repository/features"],
)
class RunCucumberTest
