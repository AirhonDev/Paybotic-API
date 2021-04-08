const { POST_TABLE } = process.env

import log from '@logger'
import { some, transform } from 'lodash'

import { getOrderByQuery } from '@utilities/RepositoryQueryUtil'
import PostRepository from '@components/posts/PostRepository'
import { IPost, IPostDto } from '@models/posts/'

const TAG = '[PostService]'

export default class PostService {
	private readonly _postRepository: PostRepository

	constructor({ PostRepository }) {
		this._postRepository = PostRepository
	}

	public async retrieveListofPosts(condition): Promise<any> {
		const METHOD = '[retrieveListofPosts]'
		log.info(`${TAG} ${METHOD}`)

		const {
			search,
			whereField,
			whereValue,
			perPage,
			page,
			orderBy,
			...rest
		} = condition

		const postCols = [`${POST_TABLE}.uuid`, `${POST_TABLE}.created_at`]
		const actualCols = [
			{ table: POST_TABLE, col: 'created_at', name: 'created_at' },
		]

		const offset = page === 1 ? 0 : (page - 1) * perPage
		const limit = page === 1 ? perPage * page : perPage
		const pagination = {
			limit: Number(limit) || 0,
			offset: Number(offset) || 0,
		}
		const orderQuery = getOrderByQuery(orderBy, actualCols)

		if (orderQuery) {
			const hasInvalidCols = some(
				orderQuery,
				({ column }) => !postCols.includes(column),
			)
			if (hasInvalidCols) {
				throw new Error('Invalid column name in "orderBy"')
			}
		}

		// const populate = [
		// 	{
		// 		table: '<ANOTHER TABLE>',
		// 		firstTableProp: 'uuid',
		// 		secondTableProp: 'uuid',
		// 		nameAs: 'namedProperty',
		// 	},
		// ]

		let queryResult

		try {
			const decoded = transform(
				rest,
				(result, value, key) => {
					return (result[key] = decodeURI(decodeURIComponent(value)))
				},
				{},
			)
			const condQuery = { ...decoded }
			if (whereField && whereValue) condQuery[whereField] = whereValue

			queryResult = await this._postRepository.findManyByCondition(
				condQuery,
				pagination,
				orderQuery,
				// populate,
			)
		} catch (DBError) {
			log.error(`${TAG} ${DBError}`)
			throw new Error(DBError)
		}

		return queryResult
	}
}
