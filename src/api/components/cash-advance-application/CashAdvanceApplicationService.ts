const { CASH_ADVANCE_APPLICATION } = process.env

import log from '@logger'
import { some, transform, map } from 'lodash'
import * as moment from 'moment'

import { getOrderByQuery } from '@utilities/RepositoryQueryUtil'
import CashAdvanceApplicationRepository from '@components/cash-advance-application/CashAdvanceApplicationRepository'
import AmortizationScheduleRepository from '@components/amortization-schedules/AmortizationScheduleRepository'
import CashAdvanceBalanceRepository from '@components/cash-advance-balances/CashAdvanceBalanceRepository'

import {
	ICashAdvanceApplication,
	ICashAdvanceApplicationDto,
} from '@models/cash-advance-application/index'
import {
	ICashAdvanceBalance,
	ICashAdvanceBalanceDto,
} from '@models/cash-advance-balances/index'

import {
	IAmortizationSchedule,
	IAmortizationSchedulesDto,
} from '@models/amortization-schedules/index'

const TAG = '[CashAdvanceApplicationService]'

export default class CashAdvanceApplicationService {
	private readonly _cashAdvanceApplicationRepository: CashAdvanceApplicationRepository
	private readonly _amortizationScheduleRepository: AmortizationScheduleRepository
	private readonly _cashAdvanceBalanceRepository: CashAdvanceBalanceRepository

	constructor({
		CashAdvanceApplicationRepository,
		AmortizationScheduleRepository,
		CashAdvanceBalanceRepository,
	}) {
		this._cashAdvanceApplicationRepository = CashAdvanceApplicationRepository
		this._amortizationScheduleRepository = AmortizationScheduleRepository
		this._cashAdvanceBalanceRepository = CashAdvanceBalanceRepository
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
			const cashAdvanceId = await this._cashAdvanceApplicationRepository.insert(
				mcaPayload,
			)
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
			// if (cashAdvanceApplicationResult.status == 'approved')
			// 	throw new Error('Cash advance application is already approved')

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

				const inBetweenDays = await this.getDaysBetweenDates(startDate, endDate)

				const numberOfDays = inBetweenDays.length

				console.log(numberOfDays)
				const factorRate = cashAdvanceApplicationResult.factor_rate
					.toString()
					.substring(1, 4)

				const paybackAmount =
					cashAdvanceApplicationResult.principal_amount +
					cashAdvanceApplicationResult.principal_amount * Number(factorRate)

				const principalAmount =
					cashAdvanceApplicationResult.principal_amount / Number(numberOfDays)

				const factoringFees = principalAmount * Number(factorRate)

				const dailyAmount = principalAmount + factoringFees

				await Promise.all(
					map(inBetweenDays, async (date) => {
						const amortizationSchedule: IAmortizationSchedule = {
							archived: false,
							merchantId: cashAdvanceApplicationResult.merchant_id,
							createdAt: new Date(Date.now()),
							dateArchived: null,
							updatedAt: null,
							uuid: 0,
							actualAmountPaid: 0,
							principalAmount: principalAmount,
							factoringFees: factoringFees,
							totalDailyRepayment: dailyAmount,
							status: 'pending',
							settlement_date: new Date(date),
							cashAdvanceApplicationId: cashAdvanceApplicationResult.uuid,
						}

						await this.saveAmortizationSchedule(amortizationSchedule)
					}),
				)


				const cashdvanceBalancePayload: ICashAdvanceBalance = {
					cashAdvanceApplicationId: cashAdvanceApplicationResult.uuid,
					merchantId: cashAdvanceApplicationResult.merchant_id,
					totalRevenue: 0,
					badDebtExpense: 0,
					factoringFeesCollected: 0,
					principalCollected: 0,
					cashAdvanceTotalRemainingBalance: paybackAmount,
					createdAt: new Date(Date.now()),
					updatedAt: new Date(Date.now()),
					dateArchived: null,
					archived: false,
				}
				const updateConditionCashAdvanceBalance = {
					cash_advance_application_id: cashAdvanceApplicationResult.uuid,
				}

				const cashAdvanceBalance = await this._cashAdvanceBalanceRepository.findOneByCondition(
					updateConditionCashAdvanceBalance,
				)

				if (!cashAdvanceBalance) {
					await this._cashAdvanceBalanceRepository.insert(
						cashdvanceBalancePayload,
					)
				}

				await this.computeAmortizationFee(cashAdvanceApplicationResult, paybackAmount)

			}
		} catch (DBError) {
			throw new Error(DBError)
		}
		return cashAdvanceApplicationResult
	}

	public async getDaysBetweenDates(startDate, endDate): Promise<any> {
		const now = startDate.clone(),
			dates = []

		while (now.isSameOrBefore(endDate)) {
			dates.push(now.format('MM/DD/YYYY'))
			now.add(1, 'days')
		}

		return dates
	}

	public async saveAmortizationSchedule(
		amortization: IAmortizationSchedule,
	): Promise<any> {
		try {
			await this._amortizationScheduleRepository.insert(amortization)
		} catch (DBError) {
			throw new Error(DBError)
		}
	}

	public async computeAmortizationFee(cashAdnvanceApplication, paybackAmount): Promise<any> {
		let result
		let computePrincipalAmount
		let computeTotalDailyAmount
		try {
			const condition = {
				cash_advance_application_id: cashAdnvanceApplication.uuid
			}
			result = await this._amortizationScheduleRepository.getByOrder(condition, 'settlement_date', 'asc')

			computePrincipalAmount = cashAdnvanceApplication.principal_amount
			computeTotalDailyAmount = paybackAmount
			console.log(computePrincipalAmount)
			console.log(computeTotalDailyAmount)


			await Promise.all(map(result, async (data) => {
				computePrincipalAmount -= data.principal_amount
				computeTotalDailyAmount -= data.total_daily_repayment

				const condition = {
					uuid: data.uuid
				}

				const updateValues = {
					remaining_principal: computePrincipalAmount < 1 ? 0 : computePrincipalAmount,
					remaining_total_balance: computeTotalDailyAmount < 1 ? 0 : computeTotalDailyAmount
				}
				await this._amortizationScheduleRepository.updateOneByCondition(condition, updateValues)
			}))

			console.log(computePrincipalAmount)
		} catch (DBError) {
			throw new Error(DBError)
		}
	}
}
