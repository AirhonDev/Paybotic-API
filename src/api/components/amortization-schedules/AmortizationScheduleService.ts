const {
	AMORTIZATION_SCHEDULES_TABLE,
	CASH_ADVANCE_PAYMENTS_TABLE,
} = process.env

import log from '@logger'
import * as moment from 'moment'
import { some, transform, map } from 'lodash'
import { resolve } from 'path'
import { pathToFileURL } from 'url'

import { getOrderByQuery } from '@utilities/RepositoryQueryUtil'
import CashAdvancePaymentsRepository from '@components/cash-advance-payments/CashAdvancePaymentsRepository'
import AmortizationScheduleRepository from '@components/amortization-schedules/AmortizationScheduleRepository'
import ExportToExcelService from '@services/ExportToExcelService'

const TAG = '[AmortizationScheduleService]'

export default class AmortizationScheduleService {
	private readonly _amortizationScheduleRepository: AmortizationScheduleRepository
	private readonly _cashAdvancePaymentsRepository: CashAdvancePaymentsRepository
	private readonly _exportToExcelService: ExportToExcelService

	constructor({
		AmortizationScheduleRepository,
		CashAdvancePaymentsRepository,
		ExportToExcelService,
	}) {
		this._amortizationScheduleRepository = AmortizationScheduleRepository
		this._cashAdvancePaymentsRepository = CashAdvancePaymentsRepository
		this._exportToExcelService = ExportToExcelService
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

		const populate = [
			{
				table: CASH_ADVANCE_PAYMENTS_TABLE,
				firstTableProp: 'uuid',
				secondTableProp: 'amortization_schedule_id',
				nameAs: 'payments',
			},
		]

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
				populate,
			)

			queryResult = {
				...queryResult.totalCount,
				data: await Promise.all(
					map(queryResult.data, async (result) => {
						result.payments = JSON.parse(result.payments)

						return result
					}),
				),
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

	public async exportAmortizationSchedule(condition): Promise<any> {
		let amortizationScheduleResult
		try {
			amortizationScheduleResult = await this.retrieveListOfAmortizationSchedules(
				condition,
			)

			const workSheetColumnNames = [
				'Cash Advance Principal',
				'Factoring Fees',
				'Total Daily Repayment',
				'Remaining Principal',
				'Remaining Total Balance',
				'Daily Sales Receipts',
				'Withholding',
				'Principal',
				'Factoring Fees',
				'Remaining Principal',
				'Remaining Total Balance',
			]
			const workSheetName = 'Amortization Schedule'
			const filePath =
				'./src/api/components/amortization-schedules/amortization-exports/amortization-schedule.xlsx'

			this._exportToExcelService.exportAmortizationSchedule(
				amortizationScheduleResult.data,
				workSheetColumnNames,
				workSheetName,
				filePath,
			)

			return pathToFileURL(filePath)
		} catch (DBError) {
			throw new Error(DBError)
		}
	}
}
