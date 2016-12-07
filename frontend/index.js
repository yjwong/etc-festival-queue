import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

import QueuesPage from './pages/queues';
import QueuePage from './pages/queue';
import QueueAdminPage from './pages/queue-admin';
import NotFoundPage from './pages/not-found';

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/" component={QueuesPage}>
      <Route path="queues/:id" component={QueuePage}>
        <Route path="admin" component={QueueAdminPage}></Route>
      </Route>
    </Route>
    <Route path="*" component={NotFoundPage}></Route>
  </Router>,
  document.getElementById('root')
);
