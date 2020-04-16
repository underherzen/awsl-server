'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserGuide = sequelize.define('UserGuide', {
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
    guide_id: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    completed: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
    day: {
      type: DataTypes.INTEGER
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
    tableName: 'user_guides',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  UserGuide.associate = function(models) {
    // associations can be defined here
  };
  return UserGuide;
};
