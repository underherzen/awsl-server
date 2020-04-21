'use strict';
const models = require('../models/index.js');
const tableNames = [
  'User',
  'Session',
  'Subscription',
  'Guide',
  'GuideDay',
  'UserGuide',
  'UserGuideDay',
  'Token',
  'ResetCurrentCourseToken',
  'Message',
  'ShortUrl'
];
module.exports = {
  up: async function(queryInterface, Sequelize) {
    const map = [];

    for (let el of tableNames) {
      let tmp;
      try {
        tmp = await queryInterface.createTable(models[el].tableName, models[el].tableAttributes);
        map.push(Promise.resolve(tmp));
      } catch (e) {
        console.log(e);
      }
    }

    return map;
  },
  down: async function(queryInterface, Sequelize) {
    const map = [];

    for (let el of tableNames.reverse()) {
      let tmp;
      try {
        tmp = await queryInterface.dropTable(el);
        map.push(Promise.resolve(tmp));
      } catch (e) {
        console.log(e);
      }
    }

    return map;
  }
};
