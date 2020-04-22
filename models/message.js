'use strict';

module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    'Message',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      twilio_sms_id: {
        type: DataTypes.STRING,
      },
      user_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      type: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      status: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      from: {
        // allowNull: false,
        type: DataTypes.STRING,
      },
      to: {
        // allowNull: false,
        type: DataTypes.STRING,
      },
      text_message: {
        // allowNull: false,
        type: DataTypes.STRING(2048),
      },
      media_url: {
        type: DataTypes.STRING(2048),
      },
      attempts_left: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
      },
      day: {
        type: DataTypes.INTEGER,
      },
      guide_id: {
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
      tableName: 'messages',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  Message.associate = function (models) {
    // associations can be defined here
  };
  return Message;
};
