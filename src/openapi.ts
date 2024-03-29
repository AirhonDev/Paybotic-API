import * as path from 'path'
import * as fs from 'fs'
import { Application } from 'express'
import { OpenApiValidator } from 'express-openapi-validator'
import * as swaggerUi from 'swagger-ui-express'
import * as JSYaml from 'js-yaml'
import { resolveRefs, ResolvedRefsResults } from 'json-refs'
import { OpenApiValidatorOpts } from 'express-openapi-validator/dist/framework/types'
import * as packageJson from '../package.json'

import errorHandler from './api/middlewares/error.handler'

export default async function (
	app: Application,
	routes: (app: Application) => void,
): Promise<void> {
	const apiRoot = JSYaml.safeLoad(
		fs
			.readFileSync(path.resolve(__dirname + '/../docs/api/swagger.yaml'))
			.toString(),
	)
	const swaggerOptions = {
		filter: ['relative', 'remote'],
		version: {},
		loaderOptions: {
			processContent: (res, callback) => {
				callback(null, JSYaml.safeLoad(res.text))
			},
		},
	}

	const swaggerDoc: ResolvedRefsResults = await resolveRefs(
		apiRoot,
		swaggerOptions,
	)
	const swaggerDocJSON = swaggerDoc.resolved as any
	// console.log('swagger doc:', swaggerDocJSON);
	swaggerDocJSON.info.title = packageJson.name
	swaggerDocJSON.info.description = packageJson.description
	swaggerDocJSON.info.version = packageJson.version
	swaggerDocJSON.info.contact.name = packageJson.author.split(' ')[0]
	const validateResponses = !!(
		process.env.OPENAPI_ENABLE_RESPONSE_VALIDATION &&
		process.env.OPENAPI_ENABLE_RESPONSE_VALIDATION.toLowerCase() === 'true'
	)
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocJSON))
	return new OpenApiValidator({
		// apiSpec,
		apiSpec: swaggerDocJSON as OpenApiValidatorOpts['apiSpec'],
		validateResponses,
		$refParser: {
			mode: 'bundle',
		},
		// operationHandlers: path.join(__dirname, './routes')
	})
		.install(app)
		.then(() => {
			routes(app)
			app.use(errorHandler)
		})
}
