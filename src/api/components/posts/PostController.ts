import { Response, NextFunction } from 'express'
import log from '@logger'

const TAG = '[LoaneeController]'

export class Controller {
	public async retrieveListofPosts(
		req: any,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> {
		const METHOD = '[retrieveListofPosts]'
		log.info(`${TAG} ${METHOD}`)
		const { PostService } = req.container.cradle
		let result
		try {
			result = await PostService.retrieveListofPosts(req.query)
		} catch (error) {
			return next(error)
		}

		req.locals.result = result.data
		req.locals.message = `Successfully retrived list of posts`
		req.locals.total = result.totalCount

		return next()
	}
}

export default new Controller()
