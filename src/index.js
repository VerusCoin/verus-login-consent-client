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
import { ThemeProvider } from '@mui/material/styles';
import { mainTheme } from './themes/main';

const router = (
  <Provider store={store}>
    <ThemeProvider theme={mainTheme}>
      <ErrorBoundary>
        <Router history={hashHistory}>
          <Route exact path="/" component={App} />
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  </Provider>
);

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    router,
    document.getElementById('app'),
  );
});