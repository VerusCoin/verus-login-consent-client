import React from 'react';
import ReactDOM from 'react-dom';
import {
  Router,
  Route,
  hashHistory
} from 'react-router';
import { Provider } from 'react-redux';
import store from './redux/store';

import App from './App';
import './index.css';
import ErrorBoundary from './components/LoginConsent/Error/ErrorBoundary';

const router = (
  <ErrorBoundary>
    <Provider store={ store }>
      <Router history={ hashHistory }>
        <Route
          exact path="/"
          component={ App } />
      </Router>
    </Provider>
  </ErrorBoundary>
);

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    router,
    document.getElementById('app'),
  );
});