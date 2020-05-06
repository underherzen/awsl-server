'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('guides', 'is_active', {
          allowNull: false,
          type: Sequelize.DataTypes.BOOLEAN,
          defaultValue: true,
        }, { transaction: t }),
        queryInterface.addColumn('guides', 'position', {
          type: Sequelize.DataTypes.INTEGER,
        }, { transaction: t })
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('guides', 'is_active', { transaction: t }),
        queryInterface.removeColumn('guides', 'position', { transaction: t })
      ]);
    });
  }
};
