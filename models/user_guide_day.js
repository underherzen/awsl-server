'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserGuideDay = sequelize.define(
    'UserGuideDay',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      guide_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      day: {
        type: DataTypes.INTEGER,
      },
      accepted: {
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      visited: {
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      message_id: {
        type: DataTypes.INTEGER,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'user_guide_days',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  UserGuideDay.associate = function (models) {
    // associations can be defined here
  };
  return UserGuideDay;
};
