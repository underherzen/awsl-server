'use strict';

module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define(
    'Subscription',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      user_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      customer: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING(100),
      },
      status: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      plan_id: {
        type: DataTypes.STRING,
      },
      coupon: {
        allowNull: true,
        type: DataTypes.STRING(100),
      },
      is_free_reg: {
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      cancel_at_period_end: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      next_payment: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      last4: {
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
      tableName: 'subscriptions',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  Subscription.associate = function (models) {
    // associations can be defined here
  };
  return Subscription;
};
