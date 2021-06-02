const { MERCHANT_TABLE } = process.env
const { ADDRESS_TABLE } = process.env
const { BUSINESS_INFORMATION_TABLE } = process.env

import log from '@logger'
import { some, transform } from 'lodash'

import MerchantRepository from '@components/merchants/MerchantRepository'
import AddressRepository from '@components/addresses/AddressRepository'
import { IMerchant, IMerchantDto } from '@models/merchants/'
import knex from 'knex'

export default class MerchantService {
	private readonly _merchantRepository: MerchantRepository
	private readonly _addressRepository: AddressRepository

	public async storeMerchant(condition): Promise<any> {
		// await this._addressRepository
		//     .insert([
		//         {
		//             street_address: '134 1st avenue grace park west',
		//         },
		//         { city: 'caloocan city' },
		//         { state: 'Manila' },
		//         { zip_code: '1345' },
		//         { country: 'Philippines' },
		//         { phone_number: '09062531550' },
		//         { fax_number: '345 3134' },
		//     ])
		//     .then(function (result) {
		//         console.log(result)
		//     })

		const addressCols = [
			{
				street_address: '134 1st avenue grace park west',
				city: 'caloocan city',
				state: 'Manila',
				zip_code: '1345',
				country: 'Philippines',
				phone_number: '09062531550',
				fax_number: '345 3134',
			},
		]
		await this._addressRepository.insert(addressCols)
	}
}
