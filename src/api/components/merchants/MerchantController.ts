import { Response, NextFunction } from 'express'
import log from '@logger'

export class Controller {
	public async storePost(
		req: any,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> {
		const METHOD = '[storePost]'
		const { MerchantService } = req.container.cradle
		let result
		try {
			await MerchantService.storeMerchant(req.body)
			console.log(req.body.firstName)
			result = req.body.firstName
		} catch (error) {
			return next(error)
		}

		req.locals.result = result
		req.locals.message = `Successfully Created a merchant`
		req.locals.total = 1

		return next()
	}
}
export default new Controller()
