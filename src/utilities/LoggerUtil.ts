import pino from 'pino'

export default pino({
	name: process.env.APP_NAME,
	level: process.env.LOG_LEVEL,
})
