import React from 'react';
import {
  CONSENT_TO_SCOPE,
  EXTERNAL_ACTION, LOADING_DISPLAY, REDIRECT, SELECT_LOGIN_ID
} from '../../utils/constants'
import ExternalAction from './ExternalAction/ExternalAction'
import Loading from '../Loading';
import Error from './Error/Error';
import Login from './Login/Login';
import { setError } from '../../redux/reducers/error/error.actions';
import Redirect from './Redirect/Redirect';
import Consent from './Consent/Consent';

export const LoginConsentRender = function() {
  const COMPONENT_PROPS = {
    pathArray: this.props.pathArray,
    completeLoginConsent: this.completeLoginConsent,
    requestResult: this.state.requestResult,
    setRequestResult: this.getRequestResult,
    canLoginOrGiveConsent: this.canLoginOrGiveConsent
  }

  const COMPONENT_MAP = {
    [EXTERNAL_ACTION]: (
      <ExternalAction
        {...COMPONENT_PROPS}
      />
    ),
    [REDIRECT]: (
      <Redirect
        {...COMPONENT_PROPS}
      />
    ),
    [SELECT_LOGIN_ID]: (
      <Login
        {...COMPONENT_PROPS}
      />
    ),
    [CONSENT_TO_SCOPE]: (
      <Consent 
        {...COMPONENT_PROPS}
      />
    ),
    [LOADING_DISPLAY]: (
      <Loading />
    )
  };

  return this.props.error != null ? (
    <Error
      error={this.props.error}
      clearError={() => this.props.dispatch(setError(null))}
      completeLoginConsent={this.completeLoginConsent}
    />
  ) : this.props.port != null && this.props.originApp != null ? (
    this.props.pathArray[0] ? (
      COMPONENT_MAP[this.props.pathArray[0]]
    ) : null
  ) : (
    <Loading />
  );
}


