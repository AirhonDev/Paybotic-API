const { CASH_ADVANCE_APPLICATION } = process.env

import log from '@logger'
import { some, transform, map } from 'lodash'
import * as moment from 'moment'

import { getOrderByQuery } from '@utilities/RepositoryQueryUtil'
import CashAdvanceApplicationRepository from '@components/cash-advance-application/CashAdvanceApplicationRepository'
import AmortizationScheduleRepository from '@components/amortization-schedules/AmortizationScheduleRepository'

import {
	ICashAdvanceApplication,
	ICashAdvanceApplicationDto,
} from '@models/cash-advance-application/index'
import {
	IAmortizationSchedule,
	IAmortizationSchedulesDto,
} from '@models/amortization-schedules/index'

const TAG = '[CashAdvanceApplicationService]'

export default class CashAdvanceApplicationService {
	private readonly _cashAdvanceApplicationRepository: CashAdvanceApplicationRepository
	private readonly _amortizationScheduleRepository: AmortizationScheduleRepository

	constructor({ CashAdvanceApplicationRepository, AmortizationScheduleRepository }) {
		this._cashAdvanceApplicationRepository = CashAdvanceApplicationRepository
		this._amortizationScheduleRepository = AmortizationScheduleRepository
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
			cashAdvanceApplicationResult = await this._cashAdvanceApplicationRepository.findOneByUuid(
				condition.cashAdvanceApplicationId,
			)
		} catch (DBError) {
			throw new Error(DBError)
		}

		return cashAdvanceApplicationResult
	}

	public async approveCashAdvanceApplication(params, body): Promise<any> {
		let cashAdvanceApplicationResult
		try {
			const condition = {
				uuid: params.cashAdvanceApplicationId,
			}
			const updateValues = {
				status: body.status,
			}
			cashAdvanceApplicationResult = await this._cashAdvanceApplicationRepository.findOneByUuid(
				params.cashAdvanceApplicationId,
			)
			if (cashAdvanceApplicationResult.status == 'approved')
				throw new Error('Cash advance application is already approved')

			await this._cashAdvanceApplicationRepository.updateOneByCondition(
				condition,
				updateValues,
			)

			cashAdvanceApplicationResult = await this._cashAdvanceApplicationRepository.findOneByUuid(
				params.cashAdvanceApplicationId,
			)

			if (cashAdvanceApplicationResult.status == 'approved') {
				const startDate = moment(cashAdvanceApplicationResult.start_date)
				const endDate = moment(cashAdvanceApplicationResult.end_date)

				const numberOfDays = endDate.diff(startDate, 'days')

				const inBetweenDays = await this.getDaysBetweenDates(startDate, endDate)

				const factorRate = cashAdvanceApplicationResult.factor_rate
					.toString()
					.substring(1, 4)

				const paybackAmount = cashAdvanceApplicationResult.principal_amount + (cashAdvanceApplicationResult.principal_amount * Number(factorRate))

				const dailyAmount = Math.round(paybackAmount / Number(numberOfDays))

				await Promise.all(map(inBetweenDays, async (date) => {
					const amortizationSchedule: IAmortizationSchedule = {
						archived: false,
						createdAt: new Date(Date.now()),
						dateArchived: null,
						updatedAt: null,
						uuid: 0,
						actual_amount_paid: 0,
						amount: dailyAmount,
						settlement_date: new Date(date),
						cash_advance_application_id: cashAdvanceApplicationResult.uuid
					}

					await this.saveAmortizationSchedule(amortizationSchedule)
				}))
			}
		} catch (DBError) {
			throw new Error(DBError)
		}
		return cashAdvanceApplicationResult
	}

	public async getDaysBetweenDates(startDate, endDate): Promise<any> {
		const now = startDate.clone(), dates = [];

		while (now.isSameOrBefore(endDate)) {
			dates.push(now.format('MM/DD/YYYY'));
			now.add(1, 'days');
		}

		return dates;
	}

	public async saveAmortizationSchedule(
		amortization: IAmortizationSchedule
	): Promise<any> {
		try {
			await this._amortizationScheduleRepository.insert(amortization)
		} catch (DBError) {
			throw new Error(DBError)
		}
	}
}
