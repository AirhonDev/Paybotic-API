import { Response, NextFunction } from 'express'
import { CreateSucess } from '@responses'
import log from '@logger'

const TAG = '[SettlementController]'

export class Controller {
	public async settlePayments(
		req: any,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> {
		const METHOD = '[settlePayments]'

		log.info(`${TAG} ${METHOD}`)

		const { SettlementService } = req.container.cradle

		let settlementResult
		try {
			settlementResult = await SettlementService.settleCashAdvance()
		} catch (error) {
			return next(error)
		}

		return res.send(
			new CreateSucess(`Successfully created new merchant`, settlementResult),
		)
	}
}
export default new Controller()
