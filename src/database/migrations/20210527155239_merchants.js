const {
  MERCHANT_TABLE,
  BUSINESS_INFORMATION_TABLE,
  ADDRESS_TABLE,
} = process.env

exports.up = function (knex) {
  return knex.schema.createTable(MERCHANT_TABLE, (t) => {
    t.increments('id').primary()
    t.string('name')
    t.string('email')
    t.string('business_name')
    t.integer('physical_address_id').unsigned()
    t.foreign('physical_address_id').references('id').inTable(ADDRESS_TABLE)
    t.integer('corporate_address_id').unsigned()
    t.foreign('corporate_address_id').references('id').inTable(ADDRESS_TABLE)
    t.integer('business_information_id').unsigned()
    t.foreign('business_information_id').references('id').inTable(BUSINESS_INFORMATION_TABLE)
    t.jsonb('business_entity')
    t.string('bank_name')
    t.string('bank_account_number')
    t.string('bank_account_rounting_number')
    t.timestamps(['created_at', 'updated_at'], [knex.fn.now(), knex.fn.now()])

  })
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists(MERCHANT_TABLE)
};
