'use strict';

module.exports = (sequelize, DataTypes) => {
  const GuideDay = sequelize.define(
    'GuideDay',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      guide_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: 'guides',
          key: 'id',
        },
      },
      day: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      title: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      text_message: {
        allowNull: false,
        type: DataTypes.STRING(2048),
      },
      challenge_name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      description: {
        allowNull: false,
        type: DataTypes.STRING(2048),
      },
      challenge: {
        allowNull: false,
        type: DataTypes.STRING(2048),
        get() {
          return this.getDataValue('challenge').split('_;_');
        },
        set(value) {
          this.setDataValue('challenge', value.join('_;_'));
        },
      },
      video_url: {
        allowNull: false,
        type: DataTypes.STRING,
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
      tableName: 'guide_days',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  GuideDay.associate = function (models) {
    // associations can be defined here
  };
  return GuideDay;
};
