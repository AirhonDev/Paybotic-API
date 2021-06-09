const { MERCHANT_TABLE } = process.env
const { ADDRESS_TABLE } = process.env
const { BUSINESS_INFORMATION_TABLE } = process.env

import log from '@logger'
import { some, transform, mapValues } from 'lodash'

import { getOrderByQuery } from '@utilities/RepositoryQueryUtil'
import MerchantRepository from '@components/merchants/MerchantRepository'
import AddressRepository from '@components/addresses/AddressRepository'
import BusinessInformationRepository from '@components/business-informations/BusinessInformationRepository'
import { IMerchant, IMerchantDto } from '@models/merchants/index'
import { IAddress, IAddressDto } from '@models/addresses/index'
import {
	IBusinessInformation,
	IBusinessInformationDto,
} from '@models/business-informations/index'

const TAG = '[MerchantService]'

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

	public async createMerchant(
		address: IAddressDto,
		businessInformation: IBusinessInformationDto,
		merchant: IMerchantDto,
	): Promise<any> {
		let merchantInfoResult
		let merchantInformationData

		const createdAt = {
			createdAt: new Date(Date.now()),
		}
		const addressInformationPayload = {
			...address,
			...createdAt,
		}

		const businessInformationPayload = {
			...businessInformation,
			...createdAt,
		}

		merchantInfoResult = await this.storeMerchantsInformation(
			addressInformationPayload,
			businessInformationPayload,
		)

		const merchantInformationPayload = {
			...merchant,
			...createdAt,
			physicalAddressId: merchantInfoResult.addressData.uuid,
			corporateAddressId: merchantInfoResult.addressData.uuid,
			businessInformationId: merchantInfoResult.businessInformationData.uuid,
		}

		merchantInformationData = await this.storeMerchant(
			merchantInformationPayload,
		)

		return { merchantInfoResult, merchantInformationData }
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

	public async retrieveListOfMerchants(condition): Promise<any> {
		const METHOD = '[retrieveListOfMerchants]'
		log.info(`${TAG} ${METHOD}`)
		const {
			search,
			whereField,
			whereValue,
			perPage,
			page,
			orderBy,
			...rest
		} = condition

		const postCols = [`${MERCHANT_TABLE}.uuid`, `${MERCHANT_TABLE}.created_at`]

		const actualCols = [
			{
				table: MERCHANT_TABLE,
				col: 'created_at',
				name: 'created_at',
			},
		]

		const offset = page === 1 ? 0 : (page - 1) * perPage
		const limit = page === 1 ? perPage * page : perPage
		const pagination = {
			limit: Number(limit) || 0,
			offset: Number(offset) || 0,
		}

		const orderQuery = getOrderByQuery(orderBy, actualCols)

		if (orderQuery) {
			const hasInvalidCols = some(
				orderQuery,
				({ column }) => !postCols.includes(column),
			)
			if (hasInvalidCols) {
				throw new Error('Invalid column name in "orderBy"')
			}
		}

		let queryResult

		try {
			const decoded = transform(
				rest,
				(result, value, key) => {
					return (result[key] = decodeURI(decodeURIComponent(value)))
				},
				{},
			)
			const condQuery = { ...decoded }
			if (whereField && whereValue) condQuery[whereField] = whereValue

			queryResult = await this._merchantRepository.findManyByCondition(
				condQuery,
				pagination,
				orderQuery,
				// populate,
			)
		} catch (DBError) {
			log.error(`${TAG} ${DBError}`)
			throw new Error(DBError)
		}

		return queryResult
	}

	public async retrieveMerchantById(condition): Promise<any> {
		let merchantResult
		let physicalAddressResult
		let corporateAddressResult
		let businessIformationResult

		try {
			merchantResult = await this._merchantRepository.findOneByCondition(
				condition.merchantId,
			)

			physicalAddressResult = await this._addressRepository.findOneByCondition(
				merchantResult[0].physical_address_id,
			)

			businessIformationResult = await this._businessInformationRepository.findOneByCondition(
				merchantResult[0].physical_address_id,
			)

			corporateAddressResult = physicalAddressResult;
			if (merchantResult[0].physical_address_id !== merchantResult[0].corporate_address_id) {
				corporateAddressResult = await this._addressRepository.findOneByCondition(
					merchantResult[0].corporate_address_id,
				)
			}

			const merchantInformationData = mapValues(
				merchantResult,
				function (merchant) {
					merchant.physical_address_id = physicalAddressResult
					merchant.corporate_address_id = corporateAddressResult
					merchant.business_information_id = businessIformationResult
					return merchant
				},
			)

			return merchantInformationData
		} catch (DBError) {
			throw new Error(DBError)
		}
	}
}
