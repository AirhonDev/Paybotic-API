import { Response, NextFunction } from 'express'
import log from '@logger'
import { CreateSucess } from '@responses'

export class Controller {
	public async storePost(
		req: any,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> {
		const METHOD = '[storePost]'
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
}
export default new Controller()
