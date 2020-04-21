'use strict';

module.exports = (sequelize, DataTypes) => {
  const ShortUrl = sequelize.define('ShortUrl', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    user_id: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    short_url: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true
    },
    full_url: {
      allowNull: false,
      type: DataTypes.STRING
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
    tableName: 'short_urls',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  ShortUrl.associate = function(models) {
    // associations can be defined here
  };
  return ShortUrl;
};
