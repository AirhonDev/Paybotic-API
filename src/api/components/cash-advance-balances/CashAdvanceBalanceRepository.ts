import BaseRepository from '@baserepository'

export default class CashAdvanceBalanceRepository extends BaseRepository {
	constructor() {
		super(process.env.CASH_ADVANCE_BALANCES_TABLE)
	}
}
