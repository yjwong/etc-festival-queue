'use strict';
const queues = [{
  id: '2301',
  name: '2301 - Havoc',
  platform: 'HTC Vive',
  location: '2301'
}];

module.exports = {
  up: (services) => {
    // Create the available queues.
    const Queue = services.sequelize.model('Queue');
    return Queue.bulkCreate(queues);
  },

  down: (services) => {
    const Queue = services.sequelize.model('Queue');
    return Queue.destroy({
      where: queues.map(queue => queue.id) 
    });
  }
}