const { MERCHANT_TABLE } = process.env
const { ADDRESS_TABLE } = process.env
const { BUSINESS_INFORMATION_TABLE } = process.env
const { PAYMENT_DASHBOARD_API_HOST, PAYMENT_DASHBOARD_API_TOKEN } = process.env

import log from '@logger'
import { some, transform, mapValues, take, map } from 'lodash'

import { getOrderByQuery } from '@utilities/RepositoryQueryUtil'
import MerchantRepository from '@components/merchants/MerchantRepository'
import AddressRepository from '@components/addresses/AddressRepository'
import BusinessInformationRepository from '@components/business-informations/BusinessInformationRepository'
import MerchantTerminalRepository from '@components/merchant-terminals/MerchantTerminalRepository'
import { IMerchant, IMerchantDto } from '@models/merchants/index'
import { IAddress, IAddressDto } from '@models/addresses/index'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import {
	IMerchantTerminal,
	IMerchantTerminalDto,
} from '@models/merchant-terminals/index'
import {
	IBusinessInformation,
	IBusinessInformationDto,
} from '@models/business-informations/index'

const TAG = '[MerchantService]'

export default class MerchantService {
	private readonly _merchantRepository: MerchantRepository
	private readonly _addressRepository: AddressRepository
	private readonly _businessInformationRepository: BusinessInformationRepository
	private readonly _merchantTerminalRepository: MerchantTerminalRepository

	constructor({
		MerchantRepository,
		AddressRepository,
		BusinessInformationRepository,
		MerchantTerminalRepository,
	}) {
		this._addressRepository = AddressRepository
		this._merchantRepository = MerchantRepository
		this._businessInformationRepository = BusinessInformationRepository
		this._merchantTerminalRepository = MerchantTerminalRepository
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
			updatedAt: new Date(Date.now()),
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
			uuid: resultAddressId[0],
		}
		const businessInformationData: IBusinessInformation = {
			...businessInformation,
			archived: false,
			createdAt: new Date(Date.now()),
			dateArchived: null,
			updatedAt: null,
			uuid: resultBusinessInformationId[0],
		}

		return { addressData, businessInformationData }
	}

	public async storeMerchant(merchant: IMerchantDto): Promise<any> {
		let merchantID
		let operatorResult

		merchantID = await this._merchantRepository.insert(merchant)

		const merchantInformationData: IMerchant = {
			...merchant,
			archived: false,
			createdAt: new Date(Date.now()),
			dateArchived: null,
			updatedAt: null,
			uuid: merchantID[0],
		}

		operatorResult = await this.retrieveOperatorByEmail(merchant.email)

		const terminals = take(operatorResult.results[0].terminals)

		map(terminals, (terminal) =>
			this.storeMerchantTerminals(terminal, merchantInformationData.uuid),
		)

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

			corporateAddressResult = physicalAddressResult
			if (
				merchantResult[0].physical_address_id !==
				merchantResult[0].corporate_address_id
			) {
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

	public async updateMerchant(condition, merchant: IMerchantDto): Promise<any> {
		let merchantResult
		try {
			const merchantPayload = {
				...merchant,
				updatedAt: new Date(Date.now()),
			}
			merchantResult = await this._merchantRepository.updateOneByUuid(
				condition.merchantId,
				merchantPayload,
			)

			const merchantInformationData: IMerchant = {
				...merchant,
				archived: false,
				createdAt: new Date(Date.now()),
				dateArchived: null,
				updatedAt: new Date(Date.now()),
				uuid: condition.merchantId,
			}

			return merchantInformationData
		} catch (DBError) {
			throw new Error(DBError)
		}
	}

	public async retrieveOperatorByEmail(email: string): Promise<any> {
		const METHOD = '[retrieveOperator]'
		log.info(`${TAG} ${METHOD}`)
		const params = new URLSearchParams({
			ordering: '-date_joined',
			search: email,
		})
		let request: AxiosRequestConfig = {
			method: 'GET',
			url: `${PAYMENT_DASHBOARD_API_HOST}/api/users/`,
			params,
			headers: {
				authorization: `Token ${PAYMENT_DASHBOARD_API_TOKEN}`,
			},
		}
		let result: AxiosResponse
		try {
			result = await axios(request)
		} catch (APIError) {
			throw new Error(APIError)
		}
		return result.data
	}

	public async storeMerchantTerminals(
		terminal: any,
		merchantId: any,
	): Promise<any> {
		const METHOD = '[storeMerchantTerminals]'
		log.info(`${TAG} ${METHOD}`)

		try {
			const merchantTerminalPayload: IMerchantTerminal = {
				merchant_id: merchantId,
				terminal_api_id: terminal.id,
				name: terminal.name,
				createdAt: new Date(Date.now()),
				dateArchived: null,
				updatedAt: null,
				archived: false,
			}

			await this._merchantTerminalRepository.insert(merchantTerminalPayload)
		} catch (DBError) {
			throw new Error(DBError)
		}
	}
}
