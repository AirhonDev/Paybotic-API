const { MERCHANT_TABLE } = process.env
const { ADDRESS_TABLE } = process.env
const { BUSINESS_INFORMATION_TABLE } = process.env

import log from '@logger'
import { some, transform } from 'lodash'
import * as moment from 'moment'

import MerchantRepository from '@components/merchants/MerchantRepository'
import AddressRepository from '@components/addresses/AddressRepository'
import BusinessInformationRepository from '@components/business-informations/BusinessInformationRepository'
import { IMerchant, IMerchantDto } from '@models/merchants/index'
import { IAddress, IAddressDto } from '@models/addresses/index'
import {
	IBusinessInformation,
	IBusinessInformationDto,
} from '@models/business-informations/index'
import knex from 'knex'

export default class MerchantService {
	private readonly _merchantRepository: MerchantRepository
	private readonly _addressRepository: AddressRepository
	private readonly _businessInformationRepository: BusinessInformationRepository

	constructor({
		MerchantRepository,
		AddressRepository,
		BusinessInformationRepository,
	}) {
		this._addressRepository = AddressRepository
		this._merchantRepository = MerchantRepository
		this._businessInformationRepository = BusinessInformationRepository
	}

	public async storeMerchantsInformation(
		address: IAddressDto,
		businessInformation: IBusinessInformationDto,
	): Promise<any> {
		let resultAddressId
		let resultBusinessInformationId
		try {
			resultAddressId = await this._addressRepository.insert(address)
			resultBusinessInformationId = await this._businessInformationRepository.insert(
				businessInformation,
			)
		} catch (DBError) {
			throw new Error(DBError)
		}

		const addressData: IAddress = {
			...address,
			archived: false,
			createdAt: new Date(Date.now()),
			dateArchived: null,
			updatedAt: null,
			uuid: resultAddressId[0], // mocked for now
		}
		const businessInformationData: IBusinessInformation = {
			...businessInformation,
			archived: false,
			createdAt: new Date(Date.now()),
			dateArchived: null,
			updatedAt: null,
			uuid: resultBusinessInformationId[0], // mocked for now
		}

		return { addressData, businessInformationData }
	}

	public async storeMerchant(merchant: IMerchantDto): Promise<any> {
		let merchantID

		merchantID = await this._merchantRepository.insert(merchant)

		const merchantInformationData: IMerchant = {
			...merchant,
			archived: false,
			createdAt: new Date(Date.now()),
			dateArchived: null,
			updatedAt: null,
			uuid: merchantID[0], // mocked for now
		}

		return merchantInformationData
	}
}
