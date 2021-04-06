import { Knex } from 'knex'

const { POST_TABLE } = process.env

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable(POST_TABLE, (t) => {
		t.string('uuid').primary()
		t.dateTime('created_at').defaultTo(knex.fn.now())
		t.dateTime('date_archived')
		t.boolean('archived').defaultTo(false)
	})
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTableIfExists(POST_TABLE)
}
