const { POST_TABLE } = process.env

exports.up = function(knex) {
  return knex.schema.createTable(POST_TABLE, (t) => {
		t.string('uuid').primary()
		t.dateTime('created_at').defaultTo(knex.fn.now())
		t.dateTime('date_archived')
		t.boolean('archived').defaultTo(false)
	})
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(POST_TABLE)
};
