const { SILA_MONEY_API_HOST } = process.env

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import log from '@logger'
import MerchantEntityRepository from '@components/merchant-entities/MerchantEntityRepository'

const TAG = '[SilaMoneyApiService]'

export default class SilaMoneyApiService {
    private readonly _merchantEntityRepository: MerchantEntityRepository

    constructor({
        MerchantEntityRepository
    }) {
        this._merchantEntityRepository = MerchantEntityRepository
    }
    public async createuserEntities(parameters: any, merchantEntityPayload: any): Promise<any> {
        const METHOD = '[createuserEntities]'
        log.info(`${TAG} ${METHOD}`)

        const request: AxiosRequestConfig = {
            method: 'POST',
            url: `${SILA_MONEY_API_HOST}/entities/individual-user`,
            data: parameters,
        }

        let result: AxiosResponse
        try {
            result = await axios(request)
        } catch (APIError) {
            throw new Error(APIError)
        }
        const payload = {
            ...merchantEntityPayload,
            privateKey: result.data.result.data.reference
        }
        await this._merchantEntityRepository.insert(payload)
        console.log(result.data.result.data)
    }

    public async requestKyc(parameters: any): Promise<any> {
        const METHOD = '[requestKyc]'
        log.info(`${TAG} ${METHOD}`)

        console.log(`${SILA_MONEY_API_HOST}/entities/` + parameters.handle + '/request-kyc');
        const request: AxiosRequestConfig = {
            method: 'POST',
            url: `${SILA_MONEY_API_HOST}/entities/` + parameters.handle + '/request-kyc',
            headers: {
                'content-type': 'application/json'
            }
        }
        let result: AxiosResponse
        try {
            result = await axios(request)
        } catch (APIError) {
            throw new Error(APIError)
        }

        console.log(result.data)
    }

    public async storeBankAccount(parameters: any): Promise<any> {
        const METHOD = '[storeBankAccount]'
        log.info(`${TAG} ${METHOD}`)

        console.log(`${SILA_MONEY_API_HOST}/bank-accounts`);
        const request: AxiosRequestConfig = {
            method: 'POST',
            url: `${SILA_MONEY_API_HOST}/bank-accounts`,
            headers: {
                'content-type': 'application/json'
            },
            data: parameters,
        }

        let result: AxiosResponse
        try {
            result = await axios(request)
        } catch (APIError) {
            throw new Error(APIError)
        }

        console.log(result.data)
    }

}
