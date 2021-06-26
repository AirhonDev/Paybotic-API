import BaseRepository from '@baserepository'

export default class AmortizationScheduleRepository extends BaseRepository {
	constructor() {
		super(process.env.AMORTIZATION_SCHEDULES_TABLE)
	}
}
