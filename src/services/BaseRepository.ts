import { knex, Knex } from 'knex'
import { mapKeys, isNil, map } from 'lodash'
// import knexConfig from '../database/knex'

import * as decamelize from 'decamelize-keys'
import camelize from 'camelcase-keys'

// declare const Raw: knex.Raw
const knexConfig = {
	client: 'mysql',
	connection: {
		host: process.env.MYSQL_HOST,
		port: process.env.MYSQL_PORT,
		user: process.env.MYSQL_USERNAME,
		password: process.env.MYSQL_PASSWORD,
		database: process.env.MYSQL_DB_NAME,
	},
}

export default abstract class {
	public table: string
	public manager: Knex

	/**
	 *
	 * @param table - MySQL table name of repository
	 */
	constructor(table: string) {
		this.table = table
		this.manager = knex(knexConfig) as any
	}

	public async insert(data: any): Promise<any> {
		try {
			return this.manager(this.table).insert(decamelize(data))
		} catch (SQLError) {
			throw new Error(SQLError)
		}
	}

	public async findOneByCondition(condition) {
		try {
			return camelize(
				await this.manager(this.table).where(condition).select().first(),
			)
		} catch (SQLError) {
			throw new Error(SQLError)
		}
	}

	public async findManyByCondition(
		condition?,
		pagination?,
		order?,
	): Promise<any> {
		let result
		let totalCount = null
		const tableName = this.table
		const conditionsWithTable = mapKeys(
			decamelize(condition),
			function (_, key) {
				return `${tableName}.${key}`
			},
		)

		try {
			const query = this.manager(this.table).select()

			if (condition) {
				query.andWhere((builder) => {
					builder.where(conditionsWithTable)
				})
			}

			const queryClone = query.clone()

			if (
				pagination &&
				(!isNil(pagination.limit) || !isNil(pagination.offset))
			) {
				const { limit, offset } = pagination
				const counts = await queryClone
					.count(`* as totalCount`)
					.groupBy(`${this.table}.uuid`)
				totalCount = { totalCount: counts.length }
				// console.log('counts.length:', counts.length)
				// console.log('offset:', offset)
				const finalOffset = counts.length <= offset ? 0 : offset
				query.limit(limit || null).offset(finalOffset)
			}

			result = await query.orderBy(order)
		} catch (SQLError) {
			throw new Error(SQLError)
		}

		if (totalCount !== null) {
			return {
				...totalCount,
				data: map(result, camelize),
			}
		}

		return result
	}

	public async updateOneByCondition(condition, updateValues) {
		try {
			return this.manager(this.table)
				.where(decamelize(condition))
				.update(decamelize(updateValues))
		} catch (SQLError) {
			throw new Error(SQLError)
		}
	}
}
