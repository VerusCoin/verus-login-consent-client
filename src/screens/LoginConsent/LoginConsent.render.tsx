import React from 'react';

import Loading from '#/components/Loading';
import {setError} from '#/redux/reducers/error/error.actions';
import {
  CONSENT_TO_SCOPE,
  CREDENTIALS_REVIEW,
  DATA_PACKET_REVIEW,
  EXTERNAL_ACTION,
  IDENTITY_UPDATE_CONTENTMULTIMAP,
  IDENTITY_UPDATE_CORE,
  LOADING_DISPLAY,
  PROVISIONING_CONFIRM,
  PROVISIONING_FORM,
  PROVISIONING_RESULT,
  REDIRECT,
  SELECT_LOGIN_ID,
  SPENDABLE_KEY_UNLOCK,
} from '#/utils/constants';

import Consent from './Consent/Consent';
import CredentialsReview from './CredentialsReview/CredentialsReview';
import DataPacket from './DataPacket/DataPacket';
import ErrorDisplay from './Error/Error';
import ExternalAction from './ExternalAction/ExternalAction';
import IdentityUpdateContentMultiMap from './IdentityUpdate/ContentMultiMap';
import IdentityUpdateCore from './IdentityUpdate/Core';
import Login from './Login/Login';
import ProvisionIdentityConfirm from './ProvisionIdentity/ProvisionIdentityConfirm';
import ProvisionIdentityForm from './ProvisionIdentity/ProvisionIdentityForm';
import ProvisionIdentityResult from './ProvisionIdentity/ProvisionIdentityResult';
import Redirect from './Redirect/Redirect';
import SpendableKeyUnlock from './SpendableKey/SpendableKeyUnlock';
import {LoginConsent} from './LoginConsent';

export const LoginConsentRender = function (
  this: InstanceType<typeof LoginConsent>
): React.ReactNode {
  const {completeLoginConsent, canProcessRequest, handleRequest} = this;
  const {requestResult} = this.state;
  const setRequestResult = this.getRequestResult.bind(this);

  const COMPONENT_MAP: Record<string, React.ReactNode> = {
    [EXTERNAL_ACTION]: (
      <ExternalAction completeLoginConsent={completeLoginConsent} handleRequest={handleRequest} />
    ),
    [REDIRECT]: (
      <Redirect
        completeLoginConsent={completeLoginConsent}
        requestResult={requestResult as object}
      />
    ),
    [SELECT_LOGIN_ID]: (
      <Login canProcessRequest={canProcessRequest} setRequestResult={setRequestResult} />
    ),
    [CONSENT_TO_SCOPE]: (
      <Consent canProcessRequest={canProcessRequest} completeLoginConsent={completeLoginConsent} />
    ),
    [IDENTITY_UPDATE_CORE]: <IdentityUpdateCore />,
    [IDENTITY_UPDATE_CONTENTMULTIMAP]: <IdentityUpdateContentMultiMap />,
    [CREDENTIALS_REVIEW]: <CredentialsReview setRequestResult={setRequestResult} />,
    [DATA_PACKET_REVIEW]: <DataPacket />,
    [PROVISIONING_FORM]: <ProvisionIdentityForm />,
    [PROVISIONING_CONFIRM]: <ProvisionIdentityConfirm />,
    [PROVISIONING_RESULT]: <ProvisionIdentityResult />,
    [SPENDABLE_KEY_UNLOCK]: <SpendableKeyUnlock completeLoginConsent={completeLoginConsent} />,
    [LOADING_DISPLAY]: <Loading />,
  };

  if (this.props.error != null) {
    return (
      <ErrorDisplay
        error={this.props.error}
        clearError={() => this.props.dispatch(setError(null))}
        completeLoginConsent={completeLoginConsent}
      />
    );
  }

  if (this.props.port != null && this.props.originApp != null) {
    const activeRoute = this.props.pathArray[0];
    return activeRoute ? (COMPONENT_MAP[activeRoute] ?? null) : null;
  }

  return <Loading />;
};
