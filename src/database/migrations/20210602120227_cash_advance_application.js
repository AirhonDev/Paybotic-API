const { CASH_ADVANCE_APPLICATION, MERCHANT_TABLE } = process.env

exports.up = function(knex) {
  return knex.schema.createTable(CASH_ADVANCE_APPLICATION, (t) => {
    t.increments('uuid').primary()
    t.integer('merchant_id').unsigned()
    t.foreign('merchant_id').references('uuid').inTable(MERCHANT_TABLE)
    t.decimal('principal_amount', 8, 2).notNullable()
    t.datetime('start_date').notNullable()
    t.datetime('end_date').notNullable()
    t.enu('payment_frequency', ['daily', 'weekly', 'monthly', 'biweekly', 'bimonthly']).notNullable()
    t.decimal('factor_rate', 4, 4).notNullable()
    t.decimal('origination_fee', 8, 2).notNullable()
    t.enu('repayment_type', ['approved', 'pending', 'cancelled', 'rejected', 'completed'])
    t.timestamps(['created_at', 'updated_at'], [knex.fn.now(), knex.fn.now()])
		t.dateTime('date_archived')
		t.boolean('archived').defaultTo(false)
	})
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists(CASH_ADVANCE_APPLICATION)
};
