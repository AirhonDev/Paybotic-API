const {
  CASH_ADVANCE_APPLICATION,
  CASH_ADVANCE_PAYMENTS_TABLE,
  AMORTIZATION_SCHEDULES_TABLE,
  MERCHANT_TABLE
} = process.env

exports.up = function (knex) {
  return knex.schema.createTable(CASH_ADVANCE_PAYMENTS_TABLE, (t) => {
    t.increments('uuid').primary()
    t.integer('cash_advance_application_id').unsigned()
    t.foreign('cash_advance_application_id').references('uuid').inTable(CASH_ADVANCE_APPLICATION)
    t.integer('amortization_schedule_id').unsigned()
    t.foreign('amortization_schedule_id').references('uuid').inTable(AMORTIZATION_SCHEDULES_TABLE)
    t.integer('merchant_id').unsigned()
    t.foreign('merchant_id').references('uuid').inTable(MERCHANT_TABLE)
    t.decimal('daily_sales', 8, 2)
    t.decimal('with_holding_amount', 8, 2)
    t.decimal('principal_amount', 8, 2)
    t.decimal('factoring_fees', 8, 2)
    t.decimal('remaining_principal', 8, 2)
    t.decimal('remaining_total_balance', 8, 2)
    t.enu('status', ['pending', 'completed', 'partial', 'missed']).index()
    t.timestamps(['created_at', 'updated_at'], [knex.fn.now(), knex.fn.now()])
    t.dateTime('date_archived')
    t.boolean('archived').defaultTo(false)
  })
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists(CASH_ADVANCE_PAYMENTS_TABLE)
};
