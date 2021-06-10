const { CASH_ADVANCE_APPLICATION } = process.env

import log from '@logger'
import { some, transform } from 'lodash'

import { getOrderByQuery } from '@utilities/RepositoryQueryUtil'
import CashAdvanceApplicationRepository from '@components/cash-advance-application/CashAdvanceApplicationRepository'
import {
	ICashAdvanceApplication,
	ICashAdvanceApplicationDto,
} from '@models/cash-advance-application/index'

const TAG = '[CashAdvanceApplicationService]'

export default class CashAdvanceApplicationService {
	private readonly _cashAdvanceApplicationRepository: CashAdvanceApplicationRepository

	constructor({ CashAdvanceApplicationRepository }) {
		this._cashAdvanceApplicationRepository = CashAdvanceApplicationRepository
	}

	public async createCashAdvanceApplication(
		mca: ICashAdvanceApplicationDto,
	): Promise<ICashAdvanceApplication> {
		const METHOD = '[createCashAdvanceApplication]'
		log.info(`${TAG} ${METHOD}`)

		const mcaPayload = {
			...mca,
			status: 'pending',
			createdAt: new Date(Date.now()),
		}

		try {
			await this._cashAdvanceApplicationRepository.insert(mcaPayload)
		} catch (DBError) {
			throw new Error(DBError)
		}

		const mcaApplication: ICashAdvanceApplication = {
			...mca,
			startDate: new Date(mca.startDate),
			archived: false,
			createdAt: new Date(Date.now()),
			dateArchived: null,
			updatedAt: null,
			uuid: 1, // mocked for now
		}

		return mcaApplication
	}

	public async retrieveListOfCashAdvanceApplications(condition): Promise<any> {
		const METHOD = '[retrieveListOfCashAdvanceApplications]'
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

		const postCols = [
			`${CASH_ADVANCE_APPLICATION}.uuid`,
			`${CASH_ADVANCE_APPLICATION}.created_at`,
		]
		const actualCols = [
			{
				table: CASH_ADVANCE_APPLICATION,
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

		// const populate = [
		// 	{
		// 		table: '<ANOTHER TABLE>',
		// 		firstTableProp: 'uuid',
		// 		secondTableProp: 'uuid',
		// 		nameAs: 'namedProperty',
		// 	},
		// ]

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

			queryResult = await this._cashAdvanceApplicationRepository.findManyByCondition(
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

	public async retrieveCashAdvanceApplicationById(condition): Promise<any> {
		let cashAdvanceApplicationResult
		try {
			cashAdvanceApplicationResult = await this._cashAdvanceApplicationRepository.findOneByCondition(
				condition.cashAdvanceApplicationId,
			)
		} catch (DBError) {
			throw new Error(DBError)
		}

		return cashAdvanceApplicationResult
	}
}
