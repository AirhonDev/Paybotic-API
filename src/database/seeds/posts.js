
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex(process.env.POST_TABLE).del()
    .then(function () {
      // Inserts seed entries
      return knex(process.env.POST_TABLE).insert([
        {uuid: '1234'},
        {uuid: '2345'},
        {uuid: '3456'}
      ]);
    });
};
