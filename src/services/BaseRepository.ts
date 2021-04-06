// import knex, { QueryBuilder } from 'knex'
import { knex, Knex } from 'knex'
import { attachPaginate } from 'knex-paginate'
import { mapKeys, isNil, map } from 'lodash'
import knexConfig from '../database/knex'

import decamelize from 'decamelize-keys'
import camelize from 'camelcase-keys'

// declare const Raw: knex.Raw

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

	public async findManyByCondition(condition?) {
		try {
			if (condition) {
				return map(
					await this.manager(this.table).where(condition).select(),
					(item) => camelize(item),
				)
			}
			return this.manager(this.table).select()
		} catch (SQLError) {
			throw new Error(SQLError)
		}
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

	public async getListWithMultipleQueries(
		condition,
		order = [],
		range = null,
		pagination = null,
		search = null,
		populate = null,
	) {
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
			const query = this.manager(this.table).select().where(conditionsWithTable)

			if (search) {
				const { query: searchQuery, bindings } = search
				query.andWhere((builder) => {
					builder.whereRaw(searchQuery, bindings)
				})
			}

			if (range && range.length > 0) {
				range.forEach((value) => {
					query.andWhere(
						value
							? (builder) => {
									builder.where(value.param, '>=', value.from)
									if (value.to) {
										builder.where(value.param, '<=', value.to)
									}
							  }
							: {},
					)
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

				query
					.select([`${this.table}.*`, ...populateData])
					.groupBy(`${this.table}.uuid`)
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
			result = await query.orderBy(order)
		} catch (SQLError) {
			throw new Error(SQLError)
		}

		if (populate && populate.length > 0) {
			result = result.map((data) => {
				const parsedData = populate.reduce(
					(p, c) => ({ ...p, [c.nameAs]: JSON.parse(data[c.nameAs]) }),
					{},
				)
				return {
					...data,
					...parsedData,
				}
			})
		}

		if (totalCount !== null) {
			return {
				...totalCount,
				data: result,
			}
		}

		return result
	}
}
