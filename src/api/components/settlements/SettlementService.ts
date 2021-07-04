import MerchantRepository from '@components/merchants/MerchantRepository'
import CashAdvanceApplicationRepository from '@components/cash-advance-application/CashAdvanceApplicationRepository'
import MerchantTerminalRepository from '@components/merchant-terminals/MerchantTerminalRepository'
import AmortizationScheduleRepository from '@components/amortization-schedules/AmortizationScheduleRepository'

import log from '@logger'
import { some, transform, mapValues, take, map } from 'lodash'
import * as moment from 'moment'

const TAG = '[SettlementService]'

export default class SettlementService {
	private readonly _cashAdvanceApplicationRepository: CashAdvanceApplicationRepository
	private readonly _merchantRepository: MerchantRepository
	private readonly _merchantTerminalRepository: MerchantTerminalRepository
	private readonly _amortizationScheduleRepository: AmortizationScheduleRepository

	constructor({
		MerchantRepository,
		CashAdvanceApplicationRepository,
		MerchantTerminalRepository,
		AmortizationScheduleRepository
	}) {
		this._cashAdvanceApplicationRepository = CashAdvanceApplicationRepository
		this._merchantRepository = MerchantRepository
		this._merchantTerminalRepository = MerchantTerminalRepository
		this._amortizationScheduleRepository = AmortizationScheduleRepository
	}

	public async settleCashAdvance(): Promise<any> {
		let results
		let terminals
		try {
			const condition = {
				settlement_date: moment().format('Y-D-M'),
			}
			results = await this._amortizationScheduleRepository.findOneByCondition(
				condition,
			)

			console.log(results)
			// const merchantIds = map(results, 'merchant_id')
			// terminals = await this._merchantTerminalRepository.findManyByWhereIn(
			// 	'merchant_id',
			// 	merchantIds,
			// )
		} catch (DBError) {
			throw new Error(DBError)
		}
		return results
	}
}
