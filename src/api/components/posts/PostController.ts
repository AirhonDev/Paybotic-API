import { Response, NextFunction } from 'express'
import log from '@logger'

const TAG = '[LoaneeController]'

export class Controller {
	public async retrieveListofLoanee(
		req: any,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> {
		const METHOD = '[retrieveListofLoanee]'
		log.info(`${TAG} ${METHOD}`)
		// const { LoaneeService } = req.container.cradle;
		let result
		try {
			// result = await LoaneeService.retrieveListofLoanee(req.query)
		} catch (error) {
			return next(error)
		}

		req.locals.result = result.data
		req.locals.message = `Successfully retrived list of`
		req.locals.total = result.totalCount

		return next()
	}
}

export default new Controller()
