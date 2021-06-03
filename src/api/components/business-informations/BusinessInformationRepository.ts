import BaseRepository from '@baserepository'

export default class BusinessInformationRepository extends BaseRepository {
	constructor() {
		super(process.env.BUSINESS_INFORMATION_TABLE)
	}
}
