import { Response, NextFunction } from 'express'
import log from '@logger'
import { CreateSucess } from '@responses'

export class Controller {
	public async storePost(
		req: any,
		res: Response,
		next: NextFunction,
	): Promise<Response | void> {
		const METHOD = '[storePost]'
		const { MerchantService } = req.container.cradle
		let merchantInfoResult
		let merchantResult
		try {
			const addressInformation = {
				...req.body.address,
				createdAt: new Date(Date.now()),
			}
			const businessInformation = {
				...req.body.businessInformation,
				createdAt: new Date(Date.now()),
			}

			merchantInfoResult = await MerchantService.storeMerchantsInformation(
				addressInformation,
				businessInformation,
			)

			const merchantInformation = {
				...req.body.merchantInformation,
				createdAt: new Date(Date.now()),
				physicalAddressId: merchantInfoResult.addressData.uuid,
				corporateAddressId: merchantInfoResult.addressData.uuid,
				businessInformationId: merchantInfoResult.businessInformationData.uuid,
				businessEntity: req.body.merchantInformation.businessEntity
			}

			merchantResult = await MerchantService.storeMerchant(merchantInformation)
		} catch (error) {
			return next(error)
		}

		return res.send(
			new CreateSucess(`Successfully created new merchant`, merchantResult),
		)
	}
}
export default new Controller()
