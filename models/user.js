'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      email: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING(100),
      },
      phone: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING(100),
      },
      password: {
        type: DataTypes.STRING(256),
      },
      type: {
        allowNull: false,
        defaultValue: 'user',
        type: DataTypes.STRING(10),
      },
      first_name: {
        allowNull: true,
        type: DataTypes.STRING(50),
      },
      last_name: {
        allowNull: true,
        type: DataTypes.STRING(50),
      },
      timezone: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      guide_id: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      google_id: {
        allowNull: true,
        unique: true,
        type: DataTypes.STRING(100),
      },
      facebook_id: {
        allowNull: true,
        unique: true,
        type: DataTypes.STRING(100),
      },
      start_day: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      start_immediately: {
        type: DataTypes.BOOLEAN,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      can_receive_texts: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      remind_about_sub_end: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      new_design: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      suggest_new_design: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
      tableName: 'users',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  User.associate = function (models) {
    // associations can be defined here
  };
  return User;
};
