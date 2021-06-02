import BaseRepository from '@baserepository'

export default class AddressRepository extends BaseRepository {
	constructor() {
		super(process.env.ADDRESS_TABLE)
	}
}
