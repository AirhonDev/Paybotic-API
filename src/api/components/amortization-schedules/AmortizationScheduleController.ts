import { Response, NextFunction } from 'express'
import log from '@logger'
import { CreateSucess } from '@responses'

const TAG = '[AmortizationScheduleController]'

export class Controller {
	public async retrieveListOfAmortizationSchedules(
		req: any,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> {
		const METHOD = '[retrieveListOfAmortizationSchedules]'
		log.info(`${TAG} ${METHOD}`)
		const { AmortizationScheduleService } = req.container.cradle
		let result
		try {
			result = await AmortizationScheduleService.retrieveListOfAmortizationSchedules(
				req.query,
			)
		} catch (error) {
			return next(error)
		}

		req.locals.result = result.data
		req.locals.message = `Successfully retrived list of amortization schedules`
		req.locals.total = result.totalCount

		return next()
	}
}

export default new Controller()
