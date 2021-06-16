import MerchantRepository from '@components/merchants/MerchantRepository'
import CashAdvanceApplicationRepository from '@components/cash-advance-application/CashAdvanceApplicationRepository'

import log from '@logger'

const TAG = '[SettlementService]'

export default class SettlementService {
	private readonly _cashAdvanceApplicationRepository: CashAdvanceApplicationRepository
	private readonly _merchantRepository: MerchantRepository

	constructor({ MerchantRepository, CashAdvanceApplicationRepository }) {
		this._cashAdvanceApplicationRepository = CashAdvanceApplicationRepository
		this._merchantRepository = MerchantRepository
	}

	public async settleCashAdvance(): Promise<any> {
		console.log('test')
	}
}
