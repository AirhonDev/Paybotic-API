const {
  AMORTIZATION_SCHEDULES_TABLE,
  CASH_ADVANCE_APPLICATION
} = process.env

exports.up = function (knex) {
  return knex.schema.createTable(AMORTIZATION_SCHEDULES_TABLE, (t) => {
    t.increments('uuid').primary()
    t.integer('cash_advance_application_id').unsigned()
    t.foreign('cash_advance_application_id').references('uuid').inTable(CASH_ADVANCE_APPLICATION)
    t.decimal('principal_amount', 8, 2)
    t.decimal('factoring_fees', 8, 2)
    t.decimal('total_daily_repayment', 8, 2)
    t.decimal('actual_amount_paid', 8, 2)
    t.enu('status', ['pending', 'completed']).index()
    t.dateTime('settlement_date')
    t.timestamps(['created_at', 'updated_at'], [knex.fn.now(), knex.fn.now()])
    t.dateTime('date_archived')
    t.boolean('archived').defaultTo(false)
  })

};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists(AMORTIZATION_SCHEDULES_TABLE)
};
