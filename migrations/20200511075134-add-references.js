'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          'user_guides',
          'guide_id',
          {
            allowNull: false,
            type: Sequelize.DataTypes.INTEGER,
            references: {
              model: 'guides',
              key: 'id',
            },
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'user_guides',
          'user_id',
          {
            allowNull: false,
            type: Sequelize.DataTypes.INTEGER,
            references: {
              model: 'users',
              key: 'id',
            },
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'user_guide_days',
          'guide_id',
          {
            allowNull: false,
            type: Sequelize.DataTypes.INTEGER,
            references: {
              model: 'guides',
              key: 'id',
            },
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'user_guide_days',
          'user_id',
          {
            allowNull: false,
            type: Sequelize.DataTypes.INTEGER,
            references: {
              model: 'users',
              key: 'id',
            },
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'subscriptions',
          'user_id',
          {
            allowNull: false,
            type: Sequelize.DataTypes.INTEGER,
            references: {
              model: 'users',
              key: 'id',
            },
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'messages',
          'user_id',
          {
            allowNull: false,
            type: Sequelize.DataTypes.INTEGER,
            references: {
              model: 'users',
              key: 'id',
            },
          },
          { transaction: t }
        ),
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('user_guides', 'guide_id', { transaction: t }),
        queryInterface.removeColumn('user_guides', 'user_id', { transaction: t }),
        queryInterface.removeColumn('user_guide_days', 'guide_id', { transaction: t }),
        queryInterface.removeColumn('user_guide_days', 'user_id', { transaction: t }),
        queryInterface.removeColumn('subscriptions', 'user_id', { transaction: t }),
        queryInterface.removeColumn('messages', 'user_id', { transaction: t }),
      ]);
    });
  },
};
