import './env'

import setupModuleAliases from './module-aliases'

if (process.env.USE_MODULE_ALIASES === 'true') {
	require('module-alias/register')
	console.log('Will use module aliases')
	setupModuleAliases()
}

import Server from './server'
import routes from './api/routes'
import cron from 'node-cron'
import SettlementService from '@components/settlements/SettlementService'

cron.schedule(
	process.env.RELEASE_REWARD_TASK_INTERVAL!,
	SettlementService.settleCashAdvance(),
)

const port = parseInt(process.env.APP_PORT)
export default new Server().router(routes).listen(port)
