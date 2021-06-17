import MerchantRepository from '@components/merchants/MerchantRepository'
import CashAdvanceApplicationRepository from '@components/cash-advance-application/CashAdvanceApplicationRepository'
import MerchantTerminalRepository from '@components/merchant-terminals/MerchantTerminalRepository'

import log from '@logger'
import { some, transform, mapValues, take, map } from 'lodash'

const TAG = '[SettlementService]'

export default class SettlementService {
	private readonly _cashAdvanceApplicationRepository: CashAdvanceApplicationRepository
	private readonly _merchantRepository: MerchantRepository
	private readonly _merchantTerminalRepository: MerchantTerminalRepository

	constructor({
		MerchantRepository,
		CashAdvanceApplicationRepository,
		MerchantTerminalRepository,
	}) {
		this._cashAdvanceApplicationRepository = CashAdvanceApplicationRepository
		this._merchantRepository = MerchantRepository
		this._merchantTerminalRepository = MerchantTerminalRepository
	}

	public async settleCashAdvance(): Promise<any> {
		let results
		let terminals
		try {
			const condition = {
				status: `approved`,
			}
			results = await this._cashAdvanceApplicationRepository.findManyByOneCondition(
				condition,
			)
			const merchantIds = map(results, 'merchant_id')
			terminals = await this._merchantTerminalRepository.findManyByWhereIn(
				'merchant_id',
				merchantIds,
			)
		} catch (DBError) {
			throw new Error(DBError)
		}
		return results
	}
}
