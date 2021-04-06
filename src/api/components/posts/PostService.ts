const { LOANEE_TABLE } = process.env

import log from '@logger'
import {
	some,
	uniq,
	keyBy,
	without,
	reject,
	isNil,
	isNumber,
	omitBy,
	omit,
	lowerCase,
} from 'lodash'

import {
	getOrderByQuery,
	getSearchQuery,
	getRangeQuery,
} from '@utilities/RepositoryQueryUtil'
import LoaneeRepository from '@components/posts/PostRepository'

const TAG = '[LoaneeService]'

export default class LoaneeService {
	private readonly _loaneeRepository: LoaneeRepository

	constructor({ LoaneeRepository }) {
		this._loaneeRepository = LoaneeRepository
	}

	public async retrieveListofLoanee(condition) {
		const METHOD = '[retrieveListofLoanee]'
		log.info(`${TAG} ${METHOD}`)

		const {
			search,
			whereField,
			whereValue,
			perPage,
			page,
			orderBy,
			createdStartDate,
			createdEndDate,
			...rest
		} = condition

		const loaneeCols = [
			`${LOANEE_TABLE}.uuid`,
			`${LOANEE_TABLE}.fundraiser_member_id`,
			`${LOANEE_TABLE}.payment_dashboard_id`,
			`${LOANEE_TABLE}.sila_user_handle`,
			`${LOANEE_TABLE}.email`,
			`${LOANEE_TABLE}.first_name`,
			`${LOANEE_TABLE}.last_name`,
			`${LOANEE_TABLE}.created_at`,
		]

		const actualCols = [
			{ table: LOANEE_TABLE, col: 'created_at', name: 'created_at' },
			{ table: LOANEE_TABLE, col: 'email', name: 'email' },
			{ table: LOANEE_TABLE, col: 'first_name', name: 'first_name' },
			{ table: LOANEE_TABLE, col: 'last_name', name: 'last_name' },
		]

		const searchCols = without(loaneeCols, 'createdAt')
		const offset = page === 1 ? 0 : (page - 1) * perPage
		const limit = page === 1 ? perPage * page : perPage
		const pagination = {
			limit: Number(limit) || 0,
			offset: Number(offset) || 0,
		}
		const orderQuery = getOrderByQuery(orderBy, actualCols)
		const searchQuery = getSearchQuery(
			search ? search.trim() : null,
			searchCols,
			LOANEE_TABLE,
		)
		const createdRange = getRangeQuery(
			createdStartDate,
			createdEndDate,
			'created_at',
			LOANEE_TABLE,
		)
		const rangeQuery = reject([createdRange], isNil)

		if (orderQuery) {
			const hasInvalidCols = some(
				orderQuery,
				({ column }) => !loaneeCols.includes(column),
			)
			if (hasInvalidCols) {
				throw new Error('Invalid column name in "orderBy"')
			}
		}

		let queryResult

		try {
			const condQuery = { ...rest }
			if (whereField && whereValue) condQuery[whereField] = whereValue

			queryResult = await this._loaneeRepository.getListWithMultipleQueries(
				condQuery,
				orderQuery,
				rangeQuery,
				pagination,
				searchQuery,
			)
		} catch (DBError) {
			log.error(`${TAG} ${DBError}`)
			throw new Error(DBError)
		}

		return queryResult
	}
}
