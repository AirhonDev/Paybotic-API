import { Response, NextFunction } from 'express'
import log from '@logger'
import { CreateSucess } from '@responses'
import * as moment from 'moment'

const TAG = '[MerchantController]'

export class Controller {
	public async createMerchant(
		req: any,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> {
		const METHOD = '[createMerchant]'
		const { MerchantService } = req.container.cradle
		let merchantInfoResult
		let merchantResult
		try {
			merchantResult = await MerchantService.createMerchant(
				req.body.address,
				req.body.businessInformation,
				req.body.merchantInformation,
			)
		} catch (error) {
			return next(error)
		}

		return res.send(
			new CreateSucess(`Successfully created new merchant`, merchantResult),
		)
	}

	public async retrieveListOfMerchants(
		req: any,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> {
		const METHOD = '[retrieveListOfMerchants]'

		log.info(`${TAG} ${METHOD}`)

		const { MerchantService } = req.container.cradle

		let result

		try {
			result = await MerchantService.retrieveListOfMerchants(req.query)
		} catch (error) {
			return next(error)
		}

		req.locals.result = result.data
		req.locals.message = `Successfully retrived list of merchants`
		req.locals.total = result.totalCount

		return next()
	}

	public async retrieveMerchantById(
		req: any,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> {
		const METHOD = '[retrieveMerchantById]'

		log.info(`${TAG} ${METHOD}`)

		const { MerchantService } = req.container.cradle
		let result
		try {
			result = await MerchantService.retrieveMerchantById(req.query)
		} catch (error) {
			return next(error)
		}

		return res.send(new CreateSucess(`Merchant Successfully Retrieved`, result))
	}

	public async updateMerchant(
		req: any,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> {
		const METHOD = '[updateMerchant]'

		log.info(`${TAG} ${METHOD}`)

		const { MerchantService } = req.container.cradle
		let updatedMerchantResult
		try {
			updatedMerchantResult = await MerchantService.updateMerchant(
				req.query,
				req.body,
			)
		} catch (error) {
			return next(error)
		}

		return res.send(
			new CreateSucess(`Successfully updated merchant`, updatedMerchantResult),
		)
	}
}
export default new Controller()
