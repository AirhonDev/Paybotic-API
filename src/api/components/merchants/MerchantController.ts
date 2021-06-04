import { Response, NextFunction } from 'express'
import log from '@logger'
import { CreateSucess } from '@responses'

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
	}
}

export default new Controller()
