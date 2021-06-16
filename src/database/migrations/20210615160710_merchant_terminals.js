const { MERCHANT_TERMINALS_TABLE,  MERCHANT_TABLE } = process.env

exports.up = function (knex) {
  return knex.schema.createTable(MERCHANT_TERMINALS_TABLE, (t) => {
    t.increments('uuid').primary()
    t.integer('merchant_id').unsigned()
    t.foreign('merchant_id').references('uuid').inTable(MERCHANT_TABLE)
    t.integer('terminal_api_id')
    t.string('name')
    t.timestamps(['created_at', 'updated_at'], [knex.fn.now(), knex.fn.now()])
    t.dateTime('date_archived')
    t.boolean('archived').defaultTo(false)
  })
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists(MERCHANT_TERMINALS_TABLE)
};
