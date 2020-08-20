'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('user_guides', 'guides_list_id', {
          //allowNull: false,
          type: Sequelize.DataTypes.INTEGER,
          references: {
            model: 'user_guides_lists',
            key: 'id',
          },
        }, { transaction: t }),
        queryInterface.addColumn('user_guide_days', 'user_guide_id', {
          //allowNull: false,
          type: Sequelize.DataTypes.INTEGER,
          references: {
            model: 'user_guides',
            key: 'id',
          },
        }, { transaction: t }),
        queryInterface.addColumn('user_guides', 'position', {
          type: Sequelize.DataTypes.INTEGER,
          validate: {
            isPositive(value) {
              if (parseInt(value) > 0) {
                throw new Error('Only positive values are allowed.');
              }
            }
          }
        }, { transaction: t }),
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('user_guides', 'guides_list_id', { transaction: t }),
        queryInterface.removeColumn('user_guide_days', 'user_guide_id', { transaction: t }),
        queryInterface.removeColumn('user_guides', 'position', { transaction: t }),
      ]);
    });
  }
};