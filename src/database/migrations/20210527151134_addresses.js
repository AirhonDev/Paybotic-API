const {
  ADDRESS_TABLE
} = process.env

exports.up = function (knex) {
  return knex.schema.createTable(ADDRESS_TABLE, (t) => {
    t.increments('uuid').primary()
    t.string('street_address')
    t.string('city')
    t.string('state')
    t.string('zip_code')
    t.string('country')
    t.string('phone_number')
    t.string('fax_number')
    t.timestamps(['created_at', 'updated_at'], [knex.fn.now(), knex.fn.now()])
    t.dateTime('date_archived')
    t.boolean('archived').defaultTo(false)
  })
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists(ADDRESS_TABLE)
};
