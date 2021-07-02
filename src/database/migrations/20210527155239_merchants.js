const {
  MERCHANT_TABLE,
  BUSINESS_INFORMATION_TABLE,
  ADDRESS_TABLE,
} = process.env

exports.up = function (knex) {
  return knex.schema.createTable(MERCHANT_TABLE, (t) => {
    t.increments('uuid').primary()
    t.string('name')
    t.string('email')
    t.string('business_name')
    t.integer('physical_address_id').unsigned()
    t.foreign('physical_address_id').references('uuid').inTable(ADDRESS_TABLE)
    t.integer('corporate_address_id').unsigned()
    t.foreign('corporate_address_id').references('uuid').inTable(ADDRESS_TABLE)
    t.integer('business_information_id').unsigned()
    t.foreign('business_information_id').references('uuid').inTable(BUSINESS_INFORMATION_TABLE)
    t.text('business_entity')
    t.string('bank_name')
    t.string('bank_account_number')
    t.string('bank_account_rounting_number')
    t.string('bank_type')
    t.string('sales_agent1').nullable()
    t.string('sales_agent2').nullable()
    t.timestamps(['created_at', 'updated_at'], [knex.fn.now(), knex.fn.now()])
    t.dateTime('date_archived')
    t.boolean('archived').defaultTo(false)
  })
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists(MERCHANT_TABLE)
};
