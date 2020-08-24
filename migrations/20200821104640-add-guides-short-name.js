'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'guides',
          'short_name',
          {
            type: Sequelize.DataTypes.STRING,
            //allowNull: false,
            unique: true,
            after: 'name',
          },
          { transaction: t }
        ),
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([queryInterface.removeColumn('guides', 'short_name', { transaction: t })]);
    });
  },
};
