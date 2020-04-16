'use strict';

module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('Subscription', {
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
    coupon: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    next_payment: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    is_trial: {
      allowNull: true,
      type: DataTypes.BOOLEAN,
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
    tableName: 'subscriptions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  Subscription.associate = function(models) {
    // associations can be defined here
  };
  return Subscription;
};
