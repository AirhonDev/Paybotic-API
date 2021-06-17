import { Response, NextFunction } from 'express'
import log from '@logger'
import { CreateSucess } from '@responses'

const TAG = '[CashAdvanceApplicationController]'

export class Controller {
	public async createCashAdvanceApplication(
		req: any,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> {
		const METHOD = '[createCashAdvanceApplication]'
		log.info(`${TAG} ${METHOD}`)
		const { CashAdvanceApplicationService } = req.container.cradle
		let result
		try {
			result = await CashAdvanceApplicationService.createCashAdvanceApplication(
				req.body,
			)
		} catch (error) {
			return next(error)
		}

		return res.send(
			new CreateSucess(
				`Successfully created new cash advance application`,
				result,
			),
		)
	}

	public async retrieveListOfCashAdvanceApplications(
		req: any,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> {
		const METHOD = '[retrieveListOfCashAdvanceApplications]'
		log.info(`${TAG} ${METHOD}`)
		const { CashAdvanceApplicationService } = req.container.cradle
		let result
		try {
			result = await CashAdvanceApplicationService.retrieveListOfCashAdvanceApplications(
				req.query,
			)
		} catch (error) {
			return next(error)
		}

		req.locals.result = result.data
		req.locals.message = `Successfully retrived list of cash advance applications`
		req.locals.total = result.totalCount

		return next()
	}

	public async retrieveCashAdvanceApplicationById(
		req: any,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> {
		const METHOD = '[retrieveCashAdvanceApplicationById]'
		log.info(`${TAG} ${METHOD}`)
		const { CashAdvanceApplicationService } = req.container.cradle
		let result
		try {
			result = await CashAdvanceApplicationService.retrieveCashAdvanceApplicationById(
				req.query,
			)
		} catch (error) {
			return next(error)
		}

		return res.send(
			new CreateSucess(
				`Cash advance application Successfully Retrieved`,
				result,
			),
		)
	}
}

export default new Controller()
