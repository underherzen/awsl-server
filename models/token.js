'use strict';

module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define(
    'Token',
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
      token: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      type: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      expiry: {
        // allowNull: false,
        type: DataTypes.DATE,
      },
      is_used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      tableName: 'tokens',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  Token.associate = function (models) {
    // associations can be defined here
  };
  return Token;
};
