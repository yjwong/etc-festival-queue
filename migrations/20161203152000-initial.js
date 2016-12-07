'use strict';
const queues = [{
  id: '2314-jod',
  name: '2314 - Munchkins & Jam-O-Draw',
  platform: 'Jam-O-Drum',
  location: '2314'
}, {
  id: '2314-kinect',
  name: '2314 - Bunny Battle',
  platform: 'Kinect',
  location: '2314'
}, {
  id: '2314-oculus',
  name: '2314 - Oculus Arcade',
  platform: 'Oculus Rift + Leap Motion',
  location: '2314'
}, {
  id: '2314-oculus-plus',
  name: '2314 - Oculus Arcade (PS Move)',
  platform: 'Oculus Rift + PS Move',
  location: '2314'
}, {
  id: '2314-oculus-props',
  name: '2314 - DinoRancher + Sweet Tooth Scramble',
  platform: 'Oculus Rift + PS Move',
  location: '2314'
}, {
  id: '2314-eyegazer',
  name: '2314 - Save or Sushi!',
  platform: 'Eyegaze Eyetracker',
  location: '2314'
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