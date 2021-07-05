const { AMORTIZATION_SCHEDULES_TABLE } = process.env

import log from '@logger'
import * as moment from 'moment'
import { some, transform, map } from 'lodash'

import { getOrderByQuery } from '@utilities/RepositoryQueryUtil'
import CashAdvancePaymentsRepository from '@components/cash-advance-payments/CashAdvancePaymentsRepository'
import AmortizationScheduleRepository from '@components/amortization-schedules/AmortizationScheduleRepository'

const TAG = '[AmortizationScheduleService]'

export default class AmortizationScheduleService {
	private readonly _amortizationScheduleRepository: AmortizationScheduleRepository
	private readonly _cashAdvancePaymentsRepository: CashAdvancePaymentsRepository

	constructor({ AmortizationScheduleRepository, CashAdvancePaymentsRepository }) {
		this._amortizationScheduleRepository = AmortizationScheduleRepository
		this._cashAdvancePaymentsRepository = CashAdvancePaymentsRepository
	}

	public async retrieveListOfAmortizationSchedules(condition): Promise<any> {
		const METHOD = '[retrieveListOfAmortizationSchedules]'
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
			`${AMORTIZATION_SCHEDULES_TABLE}.uuid`,
			`${AMORTIZATION_SCHEDULES_TABLE}.created_at`,
			`${AMORTIZATION_SCHEDULES_TABLE}.settlement_date`,
		]
		const actualCols = [
			{
				table: AMORTIZATION_SCHEDULES_TABLE,
				col: 'created_at',
				name: 'created_at',
			},
			{
				table: AMORTIZATION_SCHEDULES_TABLE,
				col: 'settlement_date',
				name: 'settlement_date',
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

			queryResult = await this._amortizationScheduleRepository.findManyByCondition(
				condQuery,
				pagination,
				orderQuery,
				// populate,
			)

			queryResult = {
				...queryResult.totalCount,
				data: await Promise.all(map(queryResult.data, async (result) => {
					const newCollection = {
						...result,
						payments: await this._cashAdvancePaymentsRepository.findOneByCondition({
							amortization_schedule_id: result.uuid
						})
					}
					return newCollection
				}))
			}

		} catch (DBError) {
			log.error(`${TAG} ${DBError}`)
			throw new Error(DBError)
		}

		return queryResult
	}

	public async retrieveAmortizationScheduleById(condition): Promise<any> {
		let cashAdvanceApplicationResult
		try {
			cashAdvanceApplicationResult = await this._amortizationScheduleRepository.findOneByUuid(
				condition.id,
			)
		} catch (DBError) {
			throw new Error(DBError)
		}

		return cashAdvanceApplicationResult
	}
}
