import MerchantRepository from '@components/merchants/MerchantRepository'
import PaymentDashboardApiService from '@components/merchants/PaymentDashboardApiService'
import CashAdvanceApplicationRepository from '@components/cash-advance-application/CashAdvanceApplicationRepository'
import MerchantTerminalRepository from '@components/merchant-terminals/MerchantTerminalRepository'
import AmortizationScheduleRepository from '@components/amortization-schedules/AmortizationScheduleRepository'
import CashAdvancePaymentsRepository from '@components/cash-advance-payments/CashAdvancePaymentsRepository'
import {
	ICashAdvancePayment,
	ICashAdvancePaymentDto,
} from '@models/cash-advance-payments/index'
import log from '@logger'
import { some, transform, mapValues, take, map } from 'lodash'
import * as moment from 'moment'

const TAG = '[SettlementService]'

export default class SettlementService {
	private readonly _cashAdvanceApplicationRepository: CashAdvanceApplicationRepository
	private readonly _merchantRepository: MerchantRepository
	private readonly _merchantTerminalRepository: MerchantTerminalRepository
	private readonly _amortizationScheduleRepository: AmortizationScheduleRepository
	private readonly _paymentDashboardApiService: PaymentDashboardApiService
	private readonly _cashAdvancePaymentsRepository: CashAdvancePaymentsRepository

	constructor({
		MerchantRepository,
		CashAdvanceApplicationRepository,
		MerchantTerminalRepository,
		AmortizationScheduleRepository,
		PaymentDashboardApiService,
		CashAdvancePaymentsRepository,
	}) {
		this._cashAdvanceApplicationRepository = CashAdvanceApplicationRepository
		this._merchantRepository = MerchantRepository
		this._merchantTerminalRepository = MerchantTerminalRepository
		this._amortizationScheduleRepository = AmortizationScheduleRepository
		this._paymentDashboardApiService = PaymentDashboardApiService
		this._cashAdvancePaymentsRepository = CashAdvancePaymentsRepository
	}

	public async settleCashAdvance(): Promise<any> {
		let results
		let terminals
		let dailySales
		try {
			const condition = {
				settlement_date: moment().format('YYYY-MM-DD'),
			}

			results = await this._amortizationScheduleRepository.findManyByOneCondition(
				condition,
			)

			let merchantTerminal
			let cashAdvance
			await Promise.all(
				map(results, async (result) => {
					const merchantCondition = {
						merchant_id: result.uuid,
					}
					merchantTerminal = await this._merchantTerminalRepository.findOneByCondition(
						merchantCondition,
					)

					dailySales = await this._paymentDashboardApiService.retrieveTerminal(
						merchantTerminal.terminal_api_id.toString(),
						moment().subtract(10, 'days').format('YYYY-MM-DD'),
						'settlement_date',
					)

					const dailySalesConverted = Number(
						dailySales.dateTotal.cash_disp.substring(1),
					)
					cashAdvance = await this._cashAdvanceApplicationRepository.findOneByUuid(
						result.cash_advance_application_id,
					)
					const factorRate = cashAdvance.factor_rate.toString().substring(1, 4)

					const withHoldingAmount = dailySalesConverted * Number(factorRate)
					const factoringFees = withHoldingAmount * Number(factorRate)
					const paybackAmount =
						cashAdvance.principal_amount +
						cashAdvance.principal_amount * Number(factorRate)
					const principalAmount = withHoldingAmount - factoringFees

					const remainingPrincipal =
						cashAdvance.principal_amount - principalAmount
					const remainingTotalBalance = paybackAmount - withHoldingAmount

					console.log(dailySalesConverted)
					console.log(withHoldingAmount)
					console.log(factoringFees)
					console.log(principalAmount)
					console.log(remainingPrincipal)
					console.log(remainingTotalBalance)

					const cashAdvancePaymentsPayload: ICashAdvancePayment = {
						cashAdvanceApplicationId: result.cash_advance_application_id,
						amortizationScheduleId: result.uuid,
						merchantId: result.merchant_id,
						dailySales: dailySalesConverted,
						withHoldingAmount,
						principalAmount,
						factoringFees,
						remainingPrincipal,
						remainingTotalBalance,
						archived: false,
						createdAt: new Date(Date.now()),
						dateArchived: null,
						updatedAt: null,
					}
					await this._cashAdvancePaymentsRepository.insert(
						cashAdvancePaymentsPayload,
					)
				}),
			)
		} catch (DBError) {
			throw new Error(DBError)
		}
		return results
	}
}
