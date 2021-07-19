import { Response, NextFunction } from 'express'
import log from '@logger'
import { CreateSucess } from '@responses'

const TAG = '[BusinessInformationController]'

export class Controller {
	public async updateBusinessInformation(
		req: any,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> {
		const METHOD = '[updateBusinessInformation]'

		log.info(`${TAG} ${METHOD}`)

		const { BusinessInformationService } = req.container.cradle
		let updatedBusinessInfo
		try {
			console.log(req.params)
			updatedBusinessInfo = await BusinessInformationService.updateBusinessInfo(
				req.params,
				req.body,
			)
		} catch (error) {
			return next(error)
		}

		return res.send(
			new CreateSucess(`Successfully updated merchant`, updatedBusinessInfo),
		)
	}
}
export default new Controller()
