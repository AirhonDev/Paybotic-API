import BaseRepository from '@baserepository'

export default class CashAdvancePaymentsRepository extends BaseRepository {
	constructor() {
		super(process.env.CASH_ADVANCE_PAYMENTS_TABLE)
	}
}
