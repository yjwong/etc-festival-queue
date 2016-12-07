'use strict';
const Sequelize = require('sequelize');
const config = require('config');

module.exports = {
  start: () => {
    const sequelize = new Sequelize(
      'etc-festival-queue', '', '',
      config.get('sequelize.options')
    );

    /**
     * Set up tables.
     */
    const Queue = sequelize.define('Queue', {
      id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      platform: Sequelize.STRING,
      location: Sequelize.STRING
    });

    const Waiter = sequelize.define('Waiter', {
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: 'Waiter_phone_QueueId_key'
      }
    });

    /**
     * Set up associations.
     */
    Queue.hasMany(Waiter);
    Waiter.belongsTo(Queue, {
      foreignKey: {
        name: 'QueueId',
        unique: 'Waiter_phone_QueueId_key'
      }
    });

    return sequelize.sync();
  },

  stop: () => {}
};
