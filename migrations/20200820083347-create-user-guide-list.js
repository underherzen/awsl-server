'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'user_guides_lists',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        user_id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        completed: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
      },
      {
        hooks: {
          beforeCreate: function (userGuideList, options, fn) {
            userGuideList.created_at = new Date();
            userGuideList.updated_at = new Date();
            fn(null, userGuideList);
          },
          beforeUpdate: function (userGuideList, options, fn) {
            userGuideList.updated_at = new Date();
            fn(null, userGuideList);
          },
        },
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_guides_lists');
  },
};
