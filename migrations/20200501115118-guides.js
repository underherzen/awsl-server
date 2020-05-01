'use strict';

module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'guides',
        'position',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
      )
    ]);
  },

  down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('guides', 'position'),
    ]);
  },
};
