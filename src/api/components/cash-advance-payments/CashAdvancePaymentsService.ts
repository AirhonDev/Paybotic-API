const { CASH_ADVANCE_PAYMENTS_TABLE } = process.env

import log from '@logger'
import { some, transform, map } from 'lodash'
import { getOrderByQuery } from '@utilities/RepositoryQueryUtil'
import AmortizationScheduleRepository from '@components/amortization-schedules/AmortizationScheduleRepository'
import CashAdvancePaymentsRepository from '@components/cash-advance-payments/CashAdvancePaymentsRepository'

const TAG = '[CashAdvancePaymentsService]'

export default class CashAdvancePaymentsService {
	private readonly _amortizationScheduleRepository: AmortizationScheduleRepository
	private readonly _cashAdvancePaymentsRepository: CashAdvancePaymentsRepository

	constructor({
		AmortizationScheduleRepository,
		CashAdvancePaymentsRepository,
	}) {
		this._amortizationScheduleRepository = AmortizationScheduleRepository
		this._cashAdvancePaymentsRepository = CashAdvancePaymentsRepository
	}

	public async retrieveListOfCashAdvancePayments(condition): Promise<any> {
		const METHOD = '[retrieveListOfCashAdvancePayments]'
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
			`${CASH_ADVANCE_PAYMENTS_TABLE}.uuid`,
			`${CASH_ADVANCE_PAYMENTS_TABLE}.created_at`,
		]
		const actualCols = [
			{
				table: CASH_ADVANCE_PAYMENTS_TABLE,
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

			queryResult = await this._cashAdvancePaymentsRepository.findManyByCondition(
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
}
