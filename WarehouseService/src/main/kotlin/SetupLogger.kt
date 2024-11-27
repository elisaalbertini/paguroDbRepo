import ch.qos.logback.classic.Level
import ch.qos.logback.classic.LoggerContext
import org.slf4j.LoggerFactory

/**
 * This class setup the context loggers
 */
class SetupLogger {
    fun setupLogger() {
        val loggerContext: LoggerContext = LoggerFactory.getILoggerFactory() as LoggerContext
        for (l in loggerContext.loggerList) {
            l.level = Level.OFF
        }
    }
}
