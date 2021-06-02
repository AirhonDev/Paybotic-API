import BaseRepository from '@baserepository'

export default class CashAdvanceApplicationRepository extends BaseRepository {
	constructor() {
		super(process.env.CASH_ADVANCE_APPLICATION)
	}
}
