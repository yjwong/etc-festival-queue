'use strict';
const os = require('os');
const path = require('path');

const Promise = require('bluebird');
const config = require('config');
const chalk = require('chalk');
const camelcase = require('camelcase');

const express = require('express');
const expressCompression = require('compression');
const expressBodyParser = require('body-parser');
const expressValidator = require('express-validator');
const expressMorgan = require('morgan');
const expressHistoryApiFallback = require('express-history-api-fallback');
const expressErrorHandler = require('errorhandler');
const expressStatusMonitor = require('express-status-monitor');

/**
 * Fundamental collections:
 *   - Queue
 *   - Waiter
 * 
 * Queue:
 *   - id
 *   - name
 *   - platform
 *   - location
 *   - waiters [list]
 * 
 * Waiter:
 *   - number
 *   - position
 *   - since
 * 
 * GET /queues
 * GET /queues/:id
 * POST /queues
 * PUT /queues/:id
 * POST /queues/:id/advance
 */

Promise.coroutine(function* () {
  /**
   * Create Express server.
   */
  const app = express();

  /**
   * Set up services.
   */
  app.services = {};
  const services = config.get('services');
  for (let name of services) {
    const service = require(`./services/${name}`);
    process.stdout.write(`Starting service ${name}...`);
    app.services[camelcase(name)] = yield service.start(app.services);
    process.stdout.write(` ${chalk.green('✓')}${os.EOL}`);
  }

  /**
   * Express configuration.
   */
  app.use(expressCompression());
  app.use(expressBodyParser.json());
  app.use(expressValidator());
  app.use(expressStatusMonitor());
  app.use(expressMorgan(config.get('express.morgan.format')));
  app.use('/kue', require('kue').app);
  app.use(express.static(path.join(__dirname, 'public')));

  /**
   * Primary app routes.
   */

  /**
   * API routes.
   */
  const queueController = require('./controllers/queue');
  app.get('/api/queues', queueController.getQueues);
  app.get('/api/queues/:id', queueController.getQueue);
  app.post('/api/queues', queueController.postQueues);
  app.put('/api/queues/:id', queueController.putQueue);
  app.delete('/api/queues/:id', queueController.deleteQueue);
  app.post('/api/queues/:id/append', queueController.appendQueue);
  app.post('/api/queues/:id/advance', queueController.advanceQueue);
  app.get('/api/queues/:id/waiters', queueController.getWaitersFromQueue);

  /**
   * Setup the error handler.
   */
  app.use(expressHistoryApiFallback('index.html', { root: path.join(__dirname, 'public') }));
  app.use(expressErrorHandler());

  /**
   * Start Express server.
   */
  app.listen(config.get('express.port'), config.get('express.host'), () => {
    console.log(`${chalk.green('✓')} App is running at http://${config.get('express.host')}:${config.get('express.port')}`);
    console.log('  Press CTRL-C to stop\n');
  });
})();