'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('users', 'on_boarded', {
          type: Sequelize.DataTypes.BOOLEAN,
          defaultValue: false,
        }, { transaction: t }),
        queryInterface.addColumn('users', 'had_mentor', {
          type: Sequelize.DataTypes.BOOLEAN,
          defaultValue: false,
        }, { transaction: t }),
        queryInterface.addColumn('users', 'mentorship', {
          type: Sequelize.DataTypes.STRING,
          get() {
            return this.getDataValue('mentorship').split('_;_');
          },
          set(value) {
            this.setDataValue('mentorship', value.join('_;_'));
          },
        }, { transaction: t }),
        queryInterface.addColumn('users', 'gender', {
          type: Sequelize.DataTypes.ENUM({
            values: ['female', 'male', 'non-binary']
          })
        }, { transaction: t }),
        queryInterface.addColumn('users', 'age', {
          type: Sequelize.DataTypes.INTEGER,
          validate: {
            isPositive(value) {
              if (parseInt(value) > 0) {
                throw new Error('Only positive values are allowed.');
              }
            }
          }
        }, { transaction: t }),
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('guides', 'is_active', { transaction: t }),
        queryInterface.removeColumn('guides', 'position', { transaction: t })
      ]);
    });
  }
};
