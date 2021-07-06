import { Response, NextFunction } from 'express'
import log from '@logger'
import { CreateSucess } from '@responses'

const TAG = '[CashAdvancePaymentsController]'

export class Controller {
	public async retrieveListOfCashAdvancePayments(
		req: any,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> {
		const METHOD = '[retrieveListOfCashAdvancePayments]'
		log.info(`${TAG} ${METHOD}`)
		const { CashAdvancePaymentsService } = req.container.cradle
		let result
		try {
			result = await CashAdvancePaymentsService.retrieveListOfCashAdvancePayments(
				req.query,
			)
		} catch (error) {
			return next(error)
		}

		req.locals.result = result.data
		req.locals.message = `Successfully retrived list of cash advance payments`
		req.locals.total = result.totalCount

		return next()
	}
}

export default new Controller()
