'use strict';

module.exports = (sequelize, DataTypes) => {
  const ResetCurrentCourseToken = sequelize.define('ResetCurrentCourseToken', {
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
    token: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true
    },
    expiry: {
      allowNull: false,
      type: DataTypes.DATE
    },
    attempts_left: {
      type: DataTypes.INTEGER,
      defaultValue: false
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
    tableName: 'reset_current_course_tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  ResetCurrentCourseToken.associate = function(models) {
    // associations can be defined here
  };
  return ResetCurrentCourseToken;
};
