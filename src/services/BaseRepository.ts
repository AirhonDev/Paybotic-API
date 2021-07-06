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

	public async findManyByCondition(
		condition?,
		pagination?,
		order?,
		populate?,
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

			let queryClone = query.clone()

			if (populate && populate.length > 0) {
				populate.forEach((value) => {
					const firstTable = value.firstTable || this.table
					const valTableName = value.alias
						? `${value.table} as ${value.alias}`
						: value.table
					query.leftJoin(
						valTableName,
						`${firstTable}.${value.firstTableProp}`,
						`${value.alias || value.table}.${value.secondTableProp}`,
					)
				})
				const tablesData = await Promise.all(
					populate.map(async (data) => ({
						...data,
						columns: Object.keys(await this.manager(data.table).columnInfo()),
					})),
				)
				const populateData = tablesData.map(
					({ table, nameAs, columns, alias, isMany = false }) => {
						const columnsDetails = columns
							.map((column) => `"${column}", ${alias || table}.${column}`)
							.join(', ')
						return this.manager.raw(
							`${
								isMany ? 'JSON_ARRAYAGG' : ''
							}(JSON_OBJECT(${columnsDetails})) as ${nameAs}`,
						)
					},
				)
				queryClone = query.clone()

				query.select([`${this.table}.*`, ...populateData])
				// .groupBy(`${this.table}.uuid`)
			}

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
			if (order) {
				result = await query.orderBy(order)
			} else {
				result = await query
			}
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

	public async updateOneByUuid(uuid, updateValues) {
		try {
			return this.manager(this.table)
				.where('uuid', uuid)
				.update(decamelize(updateValues))
		} catch (SQLError) {
			throw new Error(SQLError)
		}
	}

	public async findOneByUuid(uuid): Promise<any> {
		try {
			return this.manager(this.table).where('uuid', uuid).first()
		} catch (SQLError) {
			throw new Error(SQLError)
		}
	}

	public async findOneByCondition(condition): Promise<any> {
		try {
			return this.manager(this.table).where(condition).first()
		} catch (SQLError) {
			throw new Error(SQLError)
		}
	}

	public async findManyByOneCondition(condition): Promise<any> {
		try {
			return this.manager(this.table).where(condition)
		} catch (SQLError) {
			throw new Error(SQLError)
		}
	}

	public async findManyByWhereIn(field, value): Promise<any> {
		try {
			return this.manager(this.table).whereIn(field, value)
		} catch (SQLError) {
			throw new Error(SQLError)
		}
	}

	public async latest(field): Promise<any> {
		try {
			return this.manager(this.table).orderBy(field, 'desc').first()
		} catch (SQLError) {
			throw new Error(SQLError)
		}
	}

	public async latestWithCondition(condition, field): Promise<any> {
		try {
			return this.manager(this.table)
				.where(condition)
				.orderBy(field, 'desc')
				.first()
		} catch (SQLError) {
			throw new Error(SQLError)
		}
	}
}
