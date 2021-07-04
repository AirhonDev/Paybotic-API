import BaseRepository from '@baserepository'

export default class MerchantEntityRepository extends BaseRepository {
	constructor() {
		super(process.env.MERCHANT_ENTITIES_TABLE)
	}
}
