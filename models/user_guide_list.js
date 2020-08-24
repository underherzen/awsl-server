'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserGuideList = sequelize.define(
    'UserGuideList',
    {
      user_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      completed: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      tableName: 'user_guides_lists',
      timestamps: true,
    }
  );
  UserGuideList.associate = function (models) {
    // associations can be defined here
  };
  return UserGuideList;
};
