'use strict';

module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    token: {
      allowNull: false,
      type: DataTypes.STRING
    },
    user_id: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    user_agent: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    ip: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    expiry: {
      allowNull: false,
      type: DataTypes.DATE
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  Session.associate = function(models) {
    // associations can be defined here
  };
  return Session;
};
