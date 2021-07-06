const {
  MERCHANT_TABLE,
  MERCHANT_ENTITIES_TABLE
} = process.env

exports.up = function (knex) {
  return knex.schema.createTable(MERCHANT_ENTITIES_TABLE, (t) => {
    t.increments('uuid').primary()
    t.integer('merchant_id').unsigned()
    t.foreign('merchant_id').references('uuid').inTable(MERCHANT_TABLE)
    t.string('merchant_handle').notNullable()
    t.string('private_key').notNullable()
    t.timestamps(['created_at', 'updated_at'], [knex.fn.now(), knex.fn.now()])
    t.dateTime('date_archived')
    t.boolean('archived').defaultTo(false)
  })
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists(MERCHANT_ENTITIES_TABLE)
};
