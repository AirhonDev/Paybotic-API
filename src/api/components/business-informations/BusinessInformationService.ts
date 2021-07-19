const { BUSINESS_INFORMATION_TABLE } = process.env

import log from '@logger'
import { some, transform, map } from 'lodash'
import * as moment from 'moment'
import BusinessInformationRepository from '@components/business-informations/BusinessInformationRepository'
import {
	IBusinessInformation,
	IBusinessInformationDto,
} from '@models/business-informations/index'
const TAG = '[BusinessInformationService]'

export default class BusinessInformationService {
	private readonly _businessInformationRepository: BusinessInformationRepository

	constructor({ BusinessInformationRepository }) {
		this._businessInformationRepository = BusinessInformationRepository
	}

	public async updateBusinessInfo(
		condition,
		businessInfo: IBusinessInformationDto,
	): Promise<any> {
		let businessInformationResult
		try {
			const businessInformationPayload = {
				...businessInfo,
				updatedAt: new Date(Date.now()),
			}
			const conditionPayload = {
				uuid: condition.businessInformationId,
			}
			businessInformationResult = await this._businessInformationRepository.updateOneByCondition(
				conditionPayload,
				businessInformationPayload,
			)

			console.log(condition.businessInformationId)
			console.log(businessInformationResult)

			const businessInformationData: IBusinessInformation = {
				...businessInfo,
				archived: false,
				createdAt: new Date(Date.now()),
				dateArchived: null,
				updatedAt: new Date(Date.now()),
				uuid: condition.businessInformationId,
			}

			return businessInformationData
		} catch (DBError) {
			throw new Error(DBError)
		}
	}
}
