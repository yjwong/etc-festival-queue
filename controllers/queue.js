'use strict';
const Promise = require('bluebird');

module.exports = {
  getQueues: Promise.coroutine(function* (req, res, next) {
    const Queue = req.app.services.sequelize.model('Queue');
    const queues = yield Queue.findAll();
    res.send(queues);
    next();
  }),

  getQueue: Promise.coroutine(function* (req, res, next) {
    req.checkParams('id').notEmpty();
    const result = yield req.getValidationResult();
    if (!result.isEmpty()) {
      res.status(400).send(result.array());
      return next();
    }

    const Queue = req.app.services.sequelize.model('Queue');
    const queue = yield Queue.findById(req.params.id);
    if (!queue) {
      res.sendStatus(404);
      return next();
    }

    res.send(queue);
    return next();
  }),

  postQueues: (req, res, next) => {
    res.sendStatus(404);
    next();
  },

  putQueue: (req, res, next) => {
    res.sendStatus(404);
    next();
  },

  deleteQueue: (req, res, next) => {
    res.sendStatus(404);
    next();
  },

  appendQueue: Promise.coroutine(function* (req, res, next) {
    req.checkParams('id').notEmpty();
    req.checkBody('phone').notEmpty();
    const result = yield req.getValidationResult();
    if (!result.isEmpty()) {
      res.status(400).send(result.array());
      return next();
    }

    const Queue = req.app.services.sequelize.model('Queue');
    const queue = yield Queue.findById(req.params.id);
    if (!queue) {
      res.sendStatus(404);
      return next();
    }

    // Check with twilio if the phone number is valid.
    const lookups = req.app.services.twilioLookups;
    try {
      const number = yield lookups.phoneNumbers(req.body.phone).get();
      if (number.countryCode !== 'US') {
        res.status(400).send([{
          param: 'phone',
          msg: 'Phone number must be a US phone number'
        }]);
        return next();
      }

      // Number is valid, add to waiter list.
      const Waiter = req.app.services.sequelize.model('Waiter');
      const waiter = yield Waiter.build({
        phone: number.nationalFormat,
        QueueId: queue.id
      }).save();

      res.sendStatus(204);
      next();

    } catch (e) {
      if (e.status === 404) {
        res.status(400).send([{
          param: 'phone',
          msg: 'Phone number is not valid',
          details: e
        }]);
      } else if (e.name === 'SequelizeUniqueConstraintError') {
        res.sendStatus(409);
      } else {
        res.sendStatus(500);
        throw e;
      }

      next();
    }
  }),
  
  advanceQueue: Promise.coroutine(function* (req, res, next) {
    req.checkParams('id').notEmpty();
    req.checkBody('count', 'must be at least 1').isInt({ min: 1 })
    req.checkBody('count', 'must not be empty').notEmpty();
    const result = yield req.getValidationResult();
    if (!result.isEmpty()) {
      res.status(400).send(result.array());
      return next();
    }

    const Queue = req.app.services.sequelize.model('Queue');
    const queue = yield Queue.findById(req.params.id);
    if (!queue) {
      res.sendStatus(404);
      return next();
    }
    
    let waiters = yield queue.getWaiters();
    waiters = waiters.slice(0, req.sanitizeBody('count').toInt());
    for (let waiter of waiters) {
      req.app.services.kue.create('sms', {
        to: waiter.phone,
        queue: queue
      }).save();
      yield waiter.destroy();
    }

    res.sendStatus(204);
    next();
  }),

  getWaitersFromQueue: Promise.coroutine(function* (req, res, next) {
    req.checkParams('id').notEmpty();
    const result = yield req.getValidationResult();
    if (!result.isEmpty()) {
      res.status(400).send(result.array());
      return next();
    }

    const Queue = req.app.services.sequelize.model('Queue');
    const queue = yield Queue.findById(req.params.id);
    if (!queue) {
      res.sendStatus(404);
      return next();
    }

    const waiters = yield queue.getWaiters();
    res.send(waiters);
    next();
  })
};