import BaseRepository from '@baserepository'

export default class MerchantRepository extends BaseRepository {
	constructor() {
		super(process.env.MERCHANT_TABLE)
	}
}
