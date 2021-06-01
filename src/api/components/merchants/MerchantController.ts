import { Response, NextFunction } from 'express'
import log from '@logger'

export class Controller {
	public async storePost(
		req: any,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> {
		const METHOD = '[storePost]'
		console.log('This is fucking working')

		return next()
	}
}
export default new Controller()
