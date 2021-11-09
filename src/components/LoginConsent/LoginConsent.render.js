import React from 'react';
import {
  EXTERNAL_ACTION
} from '../../utils/constants'
import ExternalAction from './ExternalAction/ExternalAction'
import Loading from '../Loading';
import Error from './Error/Error';
import Login from './Login/Login';
import { setError } from '../../redux/reducers/error/error.actions';

export const LoginConsentRender = function() {
  const COMPONENT_PROPS = {
    pathArray: this.props.pathArray,
    setLoginConsentParams: this.getLoginConsentParams,
    loginConsentParams: this.state.loginConsentParams,
    completeAuthorization: this.completeAuthorization
  }

  const COMPONENT_MAP = {
    [EXTERNAL_ACTION]: (
      <ExternalAction
        {...COMPONENT_PROPS}
      />
    )
  };

  // return <Loading />
  // return <Error error={{ stack: "This is an error" }}/>
  // return <Login {...COMPONENT_PROPS}/>
  return this.props.error != null ? (
    <Error
      error={this.props.error}
      clearError={() => this.props.dispatch(setError(null))}
      completeAuthorization={this.completeAuthorization}
    />
  ) : this.props.port != null && this.props.originApp != null ? (
    this.props.pathArray[0] ? (
      COMPONENT_MAP[this.props.pathArray[0]]
    ) : null
  ) : (
    <Loading />
  );
}


