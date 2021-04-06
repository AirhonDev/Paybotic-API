require('dotenv').config({path: '../../.env'})

const {
	MYSQL_HOST,
	MYSQL_PORT,
	MYSQL_USERNAME,
	MYSQL_PASSWORD,
	MYSQL_DB_NAME,
} = process.env

const config = {
	client: 'mysql',
	connection: {
		host: MYSQL_HOST || 'localhost',
		port: MYSQL_PORT,
		user: MYSQL_USERNAME,
		password: MYSQL_PASSWORD,
		database: MYSQL_DB_NAME,
	},
	development: {
		client: 'mysql',
		connection: {
			host: MYSQL_HOST,
			port: MYSQL_PORT,
			user: MYSQL_USERNAME,
			password: MYSQL_PASSWORD,
			database: MYSQL_DB_NAME,
		},
		migrations: {
			directory: './migrations',
		},
		seeds: {
			directory: './seeds',
		},
	},
	staging: {
		client: 'mysql',
		connection: {
			host: MYSQL_HOST,
			port: MYSQL_PORT,
			user: MYSQL_USERNAME,
			password: MYSQL_PASSWORD,
			database: MYSQL_DB_NAME,
		},
		migrations: {
			directory: './migrations',
		},
		seeds: {
			directory: './seeds',
		},
	},
}

module.exports = config
