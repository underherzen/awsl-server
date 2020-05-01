'use strict';

module.exports = (sequelize, DataTypes) => {
  const Guide = sequelize.define(
    'Guide',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      old_guide_id: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      url_safe_name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      coach: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      img_url: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      overview: {
        allowNull: false,
        type: DataTypes.STRING(2048),
      },
      credentials: {
        allowNull: false,
        type: DataTypes.STRING,
        get() {
          return this.getDataValue('credentials').split('_;_');
        },
        set(value) {
          this.setDataValue('credentials', value.join('_;_'));
        },
      },
      video_url: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      tags: {
        type: DataTypes.STRING,
        get() {
          return this.getDataValue('tags').split('_;_');
        },
        set(value) {
          this.setDataValue('tags', value.join('_;_'));
        },
      },
      bullets: {
        type: DataTypes.STRING,
        get() {
          return this.getDataValue('bullets').split('_;_');
        },
        set(value) {
          this.setDataValue('bullets', value.join('_;_'));
        },
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
      tableName: 'guides',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
  Guide.associate = function (models) {
    // associations can be defined here
  };
  return Guide;
};
