const {
	PAYBOTIC_WALLET_ADDRESS,
	PAYBOTIC_USER_HANDLE,
	PAYBOTIC_WALLET_NICKNAME
} = process.env


import MerchantRepository from '@components/merchants/MerchantRepository'
import PaymentDashboardApiService from '@components/merchants/PaymentDashboardApiService'
import CashAdvanceApplicationRepository from '@components/cash-advance-application/CashAdvanceApplicationRepository'
import MerchantTerminalRepository from '@components/merchant-terminals/MerchantTerminalRepository'
import AmortizationScheduleRepository from '@components/amortization-schedules/AmortizationScheduleRepository'
import CashAdvancePaymentsRepository from '@components/cash-advance-payments/CashAdvancePaymentsRepository'
import CashAdvanceBalanceRepository from '@components/cash-advance-balances/CashAdvanceBalanceRepository'
import SilaMoneyApiService from '@services/SilaMoneyApiService'
import MerchantEntityRepository from '@components/merchant-entities/MerchantEntityRepository'

import {
	ICashAdvancePayment,
	ICashAdvancePaymentDto,
} from '@models/cash-advance-payments/index'
import log from '@logger'
import { some, transform, mapValues, take, map } from 'lodash'
import * as moment from 'moment'
import { stat } from 'fs'

const TAG = '[SettlementService]'

export default class SettlementService {
	private readonly _cashAdvanceApplicationRepository: CashAdvanceApplicationRepository
	private readonly _merchantRepository: MerchantRepository
	private readonly _merchantTerminalRepository: MerchantTerminalRepository
	private readonly _amortizationScheduleRepository: AmortizationScheduleRepository
	private readonly _paymentDashboardApiService: PaymentDashboardApiService
	private readonly _cashAdvancePaymentsRepository: CashAdvancePaymentsRepository
	private readonly _cashAdvanceBalanceRepository: CashAdvanceBalanceRepository
	private readonly _silaMoneyService: SilaMoneyApiService
	private readonly _merchantEntityRepository: MerchantEntityRepository

	constructor({
		MerchantRepository,
		CashAdvanceApplicationRepository,
		MerchantTerminalRepository,
		AmortizationScheduleRepository,
		PaymentDashboardApiService,
		CashAdvancePaymentsRepository,
		CashAdvanceBalanceRepository,
		SilaMoneyApiService,
		MerchantEntityRepository,
	}) {
		this._cashAdvanceApplicationRepository = CashAdvanceApplicationRepository
		this._merchantRepository = MerchantRepository
		this._merchantTerminalRepository = MerchantTerminalRepository
		this._amortizationScheduleRepository = AmortizationScheduleRepository
		this._paymentDashboardApiService = PaymentDashboardApiService
		this._cashAdvancePaymentsRepository = CashAdvancePaymentsRepository
		this._cashAdvanceBalanceRepository = CashAdvanceBalanceRepository
		this._silaMoneyService = SilaMoneyApiService
		this._merchantEntityRepository = MerchantEntityRepository

	}

	public async settleCashAdvance(): Promise<any> {
		let results
		let terminals
		let dailySales
		let latest
		let cashAdancePaymentResult
		try {
			const condition = {
				settlement_date: moment().format('YYYY-MM-DD'),
			}

			results = await this._amortizationScheduleRepository.findManyByOneCondition(
				condition,
			)

			let lastPayment
			let merchantTerminals
			let cashAdvance
			let remainingPrincipal
			let remainingTotalBalance
			latest = await Promise.all(
				map(results, async (result) => {

					const lastPaymentCondition = {
						cash_advance_application_id: result.cash_advance_application_id,
					}

					lastPayment = await this._cashAdvancePaymentsRepository.latestWithCondition(
						lastPaymentCondition,
						'uuid',
					)
					dailySales = await this.getDailySales(result)

					cashAdvance = await this._cashAdvanceApplicationRepository.findOneByUuid(
						result.cash_advance_application_id,
					)

					if (cashAdvance.repayment_type == 'daily_witholding') {
						const paymentsResult = await this.withHoldingPayment(cashAdvance, lastPayment, result, dailySales)
						const merchantEntity = await this.issueToken(paymentsResult.withHoldingAmount, result)
						await this.transferToBank(paymentsResult.withHoldingAmount, merchantEntity)
					}

					if (cashAdvance.repayment_type == 'daily_fixed_amount') {
						const paymentsResult = await this.fixedDailyRepayment(cashAdvance, lastPayment, result, dailySales)
						const merchantEntity = await this.issueToken(paymentsResult.withHoldingAmount, result)
						await this.transferToBank(paymentsResult.withHoldingAmount, merchantEntity)
					}

				}),
			)
		} catch (DBError) {
			throw new Error(DBError)
		}
		return latest
	}

	public async withHoldingPayment(cashAdvance: any, lastPayment: any, result: any, dailySales: any): Promise<any> {
		let remainingPrincipal
		let remainingTotalBalance

		try {
			const factorRate = cashAdvance.factor_rate.toString().substring(1, 4)

			const withHoldingAmount = dailySales * Number(factorRate)
			const factoringFees = withHoldingAmount * Number(factorRate)
			const paybackAmount =
				cashAdvance.principal_amount +
				cashAdvance.principal_amount * Number(factorRate)
			const principalAmount = withHoldingAmount - factoringFees

			remainingPrincipal = cashAdvance.principal_amount - principalAmount
			remainingTotalBalance = paybackAmount - withHoldingAmount

			if (lastPayment) {
				remainingPrincipal =
					lastPayment.remaining_principal - principalAmount

				remainingTotalBalance =
					lastPayment.remaining_total_balance - withHoldingAmount
			}
			console.log(dailySales)
			console.log(withHoldingAmount)
			console.log(factoringFees)
			console.log(principalAmount)
			console.log(remainingPrincipal)
			console.log(remainingTotalBalance)

			const status = result.total_daily_repayment >
				result.actual_amount_paid + withHoldingAmount
				? 'partial'
				: 'completed'

			const cashAdancePaymentResult = await this.updateCashAdvancePayments(
				result,
				dailySales,
				withHoldingAmount,
				principalAmount,
				factoringFees,
				remainingPrincipal,
				remainingTotalBalance,
				status
			)

			await this.updateAmortizationSchedule(withHoldingAmount, factoringFees, result, status)

			await this.updateCashAdvanceBalance(
				result,
				factoringFees,
				principalAmount,
				withHoldingAmount,
				remainingPrincipal
			)

			return { cashAdancePaymentResult, withHoldingAmount }
		} catch (DBError) {
			throw new Error(DBError)
		}
	}

	public async updateAmortizationSchedule(withHoldingAmount: any, factoringFees: any, result: any, status: any): Promise<any> {

		try {
			const updateCondition = {
				uuid: result.uuid,
			}

			if (withHoldingAmount > 1) {
				const updatePayload = {
					actual_amount_paid: result.actual_amount_paid + withHoldingAmount,
					status: status
				}

				await this._amortizationScheduleRepository.updateOneByCondition(
					updateCondition,
					updatePayload,
				)
			} else {
				const updatePayload = {
					actual_amount_paid: result.actual_amount_paid + withHoldingAmount,
					status: 'missed',
				}

				await this._amortizationScheduleRepository.updateOneByCondition(
					updateCondition,
					updatePayload,
				)
			}
		} catch (DBError) {
			throw new Error(DBError)
		}
	}

	public async updateCashAdvancePayments(
		result: any,
		dailySales: any,
		withHoldingAmount: any,
		principalAmount: any,
		factoringFees: any,
		remainingPrincipal: any,
		remainingTotalBalance: any,
		status: any,
	): Promise<any> {
		try {

			const cashAdvancePaymentsPayload: ICashAdvancePayment = {
				cashAdvanceApplicationId: result.cash_advance_application_id,
				amortizationScheduleId: result.uuid,
				merchantId: result.merchant_id,
				dailySales: dailySales,
				withHoldingAmount,
				principalAmount,
				factoringFees,
				remainingPrincipal,
				remainingTotalBalance,
				status: status,
				archived: false,
				createdAt: new Date(Date.now()),
				dateArchived: null,
				updatedAt: null,
			}
			await this._cashAdvancePaymentsRepository.insert(
				cashAdvancePaymentsPayload,
			)
		} catch (DBError) {
			throw new Error(DBError)
		}

	}

	public async updateCashAdvanceBalance(
		result: any,
		factoringFees: any,
		principalAmount: any,
		withHoldingAmount: any,
		remainingPrincipal: any
	): Promise<any> {
		try {
			const updateConditionCashAdvanceBalance = {
				cash_advance_application_id: result.cash_advance_application_id,
			}
			const cashAdvanceBalance = await this._cashAdvanceBalanceRepository.findOneByCondition(
				updateConditionCashAdvanceBalance,
			)

			const updatePayloadCashAdvanceBalance = {
				total_revenue: cashAdvanceBalance.total_revenue + factoringFees,
				bad_debt_expense: remainingPrincipal,
				factoring_fees_collected:
					cashAdvanceBalance.factoring_fees_collected + factoringFees,
				principal_collected:
					cashAdvanceBalance.principal_collected + principalAmount,
				cash_advance_total_remaining_balance:
					cashAdvanceBalance.cash_advance_total_remaining_balance -
					withHoldingAmount,
			}

			await this._cashAdvanceBalanceRepository.updateOneByCondition(
				updateConditionCashAdvanceBalance,
				updatePayloadCashAdvanceBalance,
			)
		} catch (DBError) {
			throw new Error(DBError)
		}

	}

	public async getDailySales(result: any): Promise<any> {
		let merchantTerminals
		let dailySales
		let dailyInvoiceDashboard
		try {
			const merchantCondition = {
				merchant_id: result.merchant_id,
			}
			merchantTerminals = await this._merchantTerminalRepository.findManyByOneCondition(
				merchantCondition,
			)

			dailySales = 0
			await Promise.all(
				map(merchantTerminals, async (terminal) => {
					dailyInvoiceDashboard = await this._paymentDashboardApiService.retrieveTerminal(
						terminal.terminal_api_id.toString(),
						moment().subtract(1, 'days').format('YYYY-MM-DD'),
						'settlement_date',
					)

					console.log(dailyInvoiceDashboard.dateTotal.cash_disp)
					dailySales += Number(
						dailyInvoiceDashboard.dateTotal.cash_disp
							.substring(1)
							.replace(/\,/g, ''),
					)
				}),
			)
		} catch (DBError) {
			throw new Error(DBError)
		}

		return dailySales
	}

	public async issueToken(withHoldingAmount: any, result: any): Promise<any> {
		try {
			const merchant = await this._merchantRepository.findOneByUuid(result.merchant_id)
			const merchantEntity = await this._merchantEntityRepository.findOneByUuid(result.merchant_id)

			const issueTokenPayload = {
				amount: withHoldingAmount * 100,
				accountName: merchant.name,
				descriptor: 'Issue Token For Transfer',
				processingType: 'STANDARD_ACH',
				handle: merchantEntity.merchant_handle
			}
			console.log(issueTokenPayload)

			await this._silaMoneyService.issueSilatoken(issueTokenPayload)

			return merchantEntity
		} catch (DBError) {
			throw new Error(DBError)
		}
	}

	public async transferToBank(withHoldingAmount: any, merchantEntity: any): Promise<any> {
		try {
			const transferToBankPayload = {
				amount: withHoldingAmount * 100,
				destinationHandle: PAYBOTIC_USER_HANDLE,
				walletNickname: PAYBOTIC_WALLET_NICKNAME,
				walletAddress: PAYBOTIC_WALLET_ADDRESS,
				descriptor: 'Transfer To Bank Transaction',
				handle: merchantEntity.merchant_handle
			}
			await this._silaMoneyService.transferToBank(transferToBankPayload)

		} catch (DBError) {
			throw new Error(DBError)
		}
	}

	public async fixedDailyRepayment(
		cashAdvance: any,
		lastPayment: any,
		result: any,
		dailySales: any
	): Promise<any> {
		let withHoldingAmount
		let remainingPrincipal
		let remainingTotalBalance
		let factoringFees
		let paybackAmount
		let principalAmount
		try {
			const factorRate = cashAdvance.factor_rate.toString().substring(1, 4)

			withHoldingAmount = dailySales
			if (dailySales > result.total_daily_repayment) {
				const remainder = dailySales - result.total_daily_repayment
				withHoldingAmount = dailySales - remainder
				factoringFees = result.factoring_fees
				paybackAmount =
					cashAdvance.principal_amount +
					cashAdvance.principal_amount * Number(factorRate)
				principalAmount = withHoldingAmount - factoringFees
				remainingPrincipal = cashAdvance.principal_amount - principalAmount
				remainingTotalBalance = paybackAmount - withHoldingAmount
			} else {
				factoringFees = withHoldingAmount * Number(factorRate)
				paybackAmount =
					cashAdvance.principal_amount +
					cashAdvance.principal_amount * Number(factorRate)
				principalAmount = withHoldingAmount - factoringFees
				remainingPrincipal = cashAdvance.principal_amount - principalAmount
				remainingTotalBalance = paybackAmount - withHoldingAmount
			}

			if (lastPayment) {
				remainingPrincipal =
					lastPayment.remaining_principal - principalAmount

				remainingTotalBalance =
					lastPayment.remaining_total_balance - withHoldingAmount
			}

			console.log(dailySales)
			console.log(withHoldingAmount)
			console.log(factoringFees)
			console.log(principalAmount)
			console.log(remainingPrincipal)
			console.log(remainingTotalBalance)

			const status = result.total_daily_repayment >
				result.actual_amount_paid + withHoldingAmount
				? 'partial'
				: 'completed'

			const cashAdancePaymentResult = await this.updateCashAdvancePayments(
				result,
				dailySales,
				withHoldingAmount,
				principalAmount,
				factoringFees,
				remainingPrincipal,
				remainingTotalBalance,
				status
			)

			await this.updateAmortizationSchedule(withHoldingAmount, factoringFees, result, status)

			await this.updateCashAdvanceBalance(
				result,
				factoringFees,
				principalAmount,
				withHoldingAmount,
				remainingPrincipal
			)

			return { cashAdancePaymentResult, withHoldingAmount }
		} catch (DBError) {
			throw new Error(DBError)
		}
	}
}
