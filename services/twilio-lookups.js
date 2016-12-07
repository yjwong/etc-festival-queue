'use strict';
const twilio = require('twilio');
const config = require('config');

module.exports = {
  start: () => {
    const client = new twilio.LookupsClient(
      config.get('twilio.sid'),
      config.get('twilio.authToken')
    );

    return Promise.resolve(client);
  }
};