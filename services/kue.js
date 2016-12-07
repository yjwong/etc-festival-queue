'use strict';
const Promise = require('bluebird');
const kue = require('kue');
const config = require('config');

module.exports = {
  start: (services) => {
    const queue = kue.createQueue({
      redis: config.get('kue.redis')
    });

    queue.process('sms', Promise.coroutine(function* (job, ctx, done) {
      yield services.twilio.messages.create({
        body: `ETC Festival 2016: ${job.data.queue.name} is now less crowded. Check it out!`,
        to: job.data.to,
        from: config.get('twilio.number')
      });
      done();
    }));

    return Promise.resolve(queue);
  }
};