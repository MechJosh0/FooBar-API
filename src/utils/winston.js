const winston = require('winston');

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.colorize({ all: true }),
		winston.format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss'
		}),
		winston.format.errors({ stack: true }),
		winston.format.splat(),
		winston.format.json()
	),
	// defaultMeta: { service: 'user-service' },
	transports: [
		//
		// - Write to all logs with level `info` and below to `combined.log`
		// - Write all logs error (and below) to `error.log`.
		//
		new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
		new winston.transports.File({ filename: 'logs/combined.log' })
	]
});

if(process.env.NODE_ENV !== 'production')
{
	logger.add(new winston.transports.Console({
		level: 'silly',
		format: winston.format.simple()
	}));
}

module.exports = logger;
