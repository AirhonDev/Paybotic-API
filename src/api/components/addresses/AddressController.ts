import { Response, NextFunction } from 'express'
import log from '@logger'
import { CreateSucess } from '@responses'

const TAG = '[AddressController]'

export class Controller {
	public async updateAddress(
		req: any,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> {
		const METHOD = '[updateAddress]'

		log.info(`${TAG} ${METHOD}`)

		const { AddressService } = req.container.cradle
		let updatedAddress
		try {
			console.log(req.params)
			updatedAddress = await AddressService.updateAddress(req.params, req.body)
		} catch (error) {
			return next(error)
		}

		return res.send(
			new CreateSucess(`Successfully updated address`, updatedAddress),
		)
	}
}
export default new Controller()
