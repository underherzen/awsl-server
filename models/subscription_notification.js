'use strict';

module.exports = (sequelize, DataTypes) => {
  const SubscriptionNotification = sequelize.define(
    'SubscriptionNotification',
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
      discount_modal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      end_of_subscription: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      last_trial_day: {
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
      tableName: 'subscription_notifications',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  SubscriptionNotification.associate = function (models) {
    // associations can be defined here
  };
  return SubscriptionNotification;
};
