'use strict';
const Umzug = require('umzug');
const config = require('config');

module.exports = {
  start: (services) => {
    const umzug = new Umzug({
      storage: 'json',
      storageOptions: config.get('umzug.storageOptions'),
      migrations: {
        params: [ services ],
        path: config.get('umzug.migrations.path')
      }
    });

    return umzug.up();
  },

  stop: () => {}
};