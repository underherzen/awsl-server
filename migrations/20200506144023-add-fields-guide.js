'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('Guide', 'is_active', {
          allowNull: false,
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        }, { transaction: t }),
        queryInterface.addColumn('Guide', 'position', {
          type: DataTypes.INTEGER,
        }, { transaction: t })
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('Guide', 'is_active', { transaction: t }),
        queryInterface.removeColumn('Guide', 'position', { transaction: t })
      ]);
    });
  }
};
