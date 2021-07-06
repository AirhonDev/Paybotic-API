const { ADDRESS_TABLE } = process.env

import log from '@logger'
import { some, transform, map } from 'lodash'
import * as moment from 'moment'
import BusinessInformationRepository from '@components/business-informations/BusinessInformationRepository'
import AddressRepository from '@components/addresses/AddressRepository'

import {
    IAddress,
    IAddressDto,
} from '@models/addresses/index'
const TAG = '[AddressService]'

export default class AddressService {
    private readonly _addressRepository: AddressRepository

    constructor({ AddressRepository }) {
        this._addressRepository = AddressRepository
    }

    public async updateAddress(
        condition,
        address: IAddressDto,
    ): Promise<any> {
        let addressResult
        try {
            const addressPayload = {
                ...address,
                updatedAt: new Date(Date.now()),
            }
            const conditionPayload = {
                uuid: condition.addressId
            }
            addressResult = await this._addressRepository.updateOneByCondition(
                conditionPayload,
                addressPayload,
            )

            console.log(condition.addressId)
            console.log(addressResult)

            const addressData: IAddress = {
                ...address,
                archived: false,
                createdAt: new Date(Date.now()),
                dateArchived: null,
                updatedAt: new Date(Date.now()),
                uuid: condition.addressId,
            }

            return addressData
        } catch (DBError) {
            throw new Error(DBError)
        }
    }
}
