const {
  CASH_ADVANCE_APPLICATION,
  CASH_ADVANCE_BALANCES_TABLE,
  MERCHANT_TABLE
} = process.env

exports.up = function (knex) {
  return knex.schema.createTable(CASH_ADVANCE_BALANCES_TABLE, (t) => {
    t.increments('uuid').primary()
    t.integer('cash_advance_application_id').unsigned()
    t.foreign('cash_advance_application_id').references('uuid').inTable(CASH_ADVANCE_APPLICATION)
    t.integer('merchant_id').unsigned()
    t.foreign('merchant_id').references('uuid').inTable(MERCHANT_TABLE)
    t.decimal('total_revenue', 8, 2)
    t.decimal('bad_debt_expense', 8, 2)
    t.decimal('factoring_fees_collected', 8, 2)
    t.decimal('principal_collected', 8, 2)
    t.decimal('cash_advance_total_remaining_balance', 8, 2)
    t.timestamps(['created_at', 'updated_at'], [knex.fn.now(), knex.fn.now()])
    t.dateTime('date_archived')
    t.boolean('archived').defaultTo(false)
  })
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists(CASH_ADVANCE_BALANCES_TABLE)
};
