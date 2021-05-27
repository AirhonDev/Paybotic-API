const { BUSINESS_INFORMATION_TABLE } = process.env

exports.up = function (knex) {
  return knex.schema.createTable(BUSINESS_INFORMATION_TABLE, (t) => {
    t.increments('id').primary()
    t.string('owner1_first_name')
    t.string('owner1_last_name')
    t.string('owner2_first_name').nullable()
    t.string('owner2_last_name').nullable()
    t.string('primary_contact_name')
    t.string('title')
    t.string('id_number')
    t.enu('tin_type', ['ein', 'ssn'])
    t.string('business_license')
    t.string('business_license_state')
    t.integer('number_of_locations')
    t.datetime('business_formation_date')
    t.timestamps(['created_at', 'updated_at'], [knex.fn.now(), knex.fn.now()])
  })

};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists(BUSINESS_INFORMATION_TABLE)
};
