import BaseRepository from '@baserepository'

export default class MerchantTerminalRepository extends BaseRepository {
	constructor() {
		super(process.env.MERCHANT_TERMINALS_TABLE)
	}
}
