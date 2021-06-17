const { PAYMENT_DASHBOARD_API_HOST, PAYMENT_DASHBOARD_API_TOKEN } = process.env
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import log from '@logger'

const TAG = '[PaymentDashboardApiService]'
export default class PaymentDashboardApiService {
	public async retrieveOperators(): Promise<any> {
		const METHOD = '[retrieveOperators]'
		log.info(`${TAG} ${METHOD}`)
		const request: AxiosRequestConfig = {
			method: 'GET',
			url: `${PAYMENT_DASHBOARD_API_HOST}/api/users`,
			headers: {
				authorization: `Token ${PAYMENT_DASHBOARD_API_TOKEN}`,
			},
		}
		let result: AxiosResponse
		try {
			result = await axios(request)
		} catch (APIError) {
			throw new Error(APIError)
		}
		return result.data
	}
	public async retrieveOperatorById(id: string): Promise<any> {
		const METHOD = '[retrieveOperator]'
		log.info(`${TAG} ${METHOD}`)
		let request: AxiosRequestConfig = {
			method: 'GET',
			url: `${PAYMENT_DASHBOARD_API_HOST}/api/users/${id}`,
			headers: {
				authorization: `Token ${PAYMENT_DASHBOARD_API_TOKEN}`,
			},
		}
		console.log('request:', request)
		let result: AxiosResponse
		try {
			result = await axios(request)
		} catch (APIError) {
			throw new Error(APIError)
		}
		return result.data
	}
	public async retrieveOperatorByEmail(email: string): Promise<any> {
		const METHOD = '[retrieveOperator]'
		log.info(`${TAG} ${METHOD}`)
		const params = new URLSearchParams({
			ordering: '-date_joined',
			search: email,
		})
		let request: AxiosRequestConfig = {
			method: 'GET',
			url: `${PAYMENT_DASHBOARD_API_HOST}/api/users/`,
			params,
			headers: {
				authorization: `Token ${PAYMENT_DASHBOARD_API_TOKEN}`,
			},
		}
		let result: AxiosResponse
		try {
			result = await axios(request)
		} catch (APIError) {
			throw new Error(APIError)
		}
		return result.data
	}
	public async retrieveTerminal(
		id: string,
		currentDate: string,
		dateType: string,
	): Promise<any> {
		const METHOD = '[retrieveTerminal]'
		log.info(`${TAG} ${METHOD}`)
		const params = new URLSearchParams({
			current_date: currentDate,
			date_type: dateType,
		})
		let request: AxiosRequestConfig = {
			method: 'GET',
			url: `${PAYMENT_DASHBOARD_API_HOST}/api/terminals/${id}`,
			params,
			headers: {
				authorization: `Token ${PAYMENT_DASHBOARD_API_TOKEN}`,
			},
		}
		let result: AxiosResponse
		try {
			result = await axios(request)
		} catch (APIError) {
			throw new Error(APIError)
		}
		return result.data
	}
}
