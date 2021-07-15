import * as express from 'express'
import * as path from 'path'
import * as bodyParser from 'body-parser'
import * as http from 'http'
import os from 'os'
import l from '@logger'

import installValidator from './openapi'

import { createContainer } from 'awilix'
import initializeLoaders from './loaders/index'

import * as cors from 'cors'

const app = express()
const exit = process.exit

export default class ExpressServer {
	private routes: (app: express.Application) => void
	constructor() {
		const root = path.normalize(__dirname + '/..')
		app.set('appPath', root + 'client')
		app.use(bodyParser.json({ limit: process.env.REQUEST_LIMIT || '100kb' }))
		app.use(
			bodyParser.urlencoded({
				extended: true,
				limit: process.env.REQUEST_LIMIT || '100kb',
			}),
		)
		app.use(bodyParser.text({ limit: process.env.REQUEST_LIMIT || '100kb' }))
		app.use(express.static(`${root}/public`))
		app.use(express.static(`${root}/public/amortization-exports`))

		/** CORS */
		app.use(
			cors({
				origin: '*',
				methods: '*',
			}),
		)

		/** Awilix */
		const container = createContainer()
		initializeLoaders(container)

		/** Global Middlewares */

		app.use((req: any, res: express.Response, next) => {
			req.container = container
			req.locals = {}

			next()
		})
	}

	router(routes: (app: express.Application) => void): ExpressServer {
		this.routes = routes
		return this
	}

	listen(port: number): express.Application {
		const welcome = (p: number) => (): void =>
			l.info(
				`up and running in ${
					process.env.NODE_ENV || 'development'
				} @: ${os.hostname()} on port: ${p}}`,
			)

		const introduceAPIDocumentation = (): void =>
			l.info(
				`API Documentation: ${process.env.APP_HOST}:${process.env.APP_PORT}/api-docs`,
			)

		installValidator(app, this.routes)
			.then(() => {
				http.createServer(app).listen(port, () => {
					welcome(port)
					introduceAPIDocumentation()
				})
			})
			.catch((e) => {
				l.error(e)
				exit(1)
			})

		return app
	}
}
