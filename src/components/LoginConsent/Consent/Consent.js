import React from 'react';
import { connect } from 'react-redux';
import { setExternalAction, setNavigationPath } from '../../../redux/reducers/navigation/navigation.actions';
import { 
  ConsentRender
} from './Consent.render';
import { EXTERNAL_ACTION, EXTERNAL_CHAIN_START, REDIRECT, SCOPES, SELECT_LOGIN_ID } from '../../../utils/constants'
import { checkAndUpdateIdentities } from '../../../redux/reducers/identity/identity.actions';
import { signResponse } from '../../../rpc/calls/signResponse';
import { setError } from '../../../redux/reducers/error/error.actions';
import { LoginConsentDecision, LoginConsentResponse } from 'verus-typescript-primitives';
import BigNumber from 'bignumber.js';

class Consent extends React.Component {
  constructor(props) {
    super(props);
    const requestedPermissions = props.loginConsentRequest.request.challenge.requested_access

    let leftText = []
    let rightText = []

    if (requestedPermissions != null) {
      for (const header in SCOPES) {
        for (const vdxfid in SCOPES[header]) {
          // Match permissions to the possible ids in the scopes.
          for (const permission of requestedPermissions) {
            if (permission.vdxfkey === vdxfid) {
              const value = SCOPES[header][vdxfid]

              if (rightText.length > 0) {
                leftText.push('\n')
              } else {
                leftText.push(header)
              }
    
              rightText.push(value.description)
            }
          }
        }
      }
    }

    this.state = {
      loading: false
    }

    this.tryLogin = this.tryLogin.bind(this);
    this.cancel = this.cancel.bind(this);
    this.leftText = leftText;
    this.rightText = rightText;
  }

  tryLogin() {
    this.setState({ loading: true }, async () => {
      const { request } = this.props.loginConsentRequest
      const userActions = await checkAndUpdateIdentities(request.chain_id)
      userActions.map(action => this.props.dispatch(action))

      if (this.props.canLoginOrGiveConsent()) {
        try {
          let response = new LoginConsentResponse({
            system_id: request.system_id,
            signing_id: this.props.activeIdentity.identity.identityaddress,
            decision: new LoginConsentDecision({
              decision_id: request.challenge.challenge_id,
              request: request,
              created_at: BigNumber(Date.now())
                .dividedBy(1000)
                .decimalPlaces(0)
                .toNumber(),
            })
          });

          response.chain_id = request.chain_id
          
          const sigRes = await signResponse(response);
          
          this.props.setRequestResult(sigRes, () => {
            this.props.dispatch(setNavigationPath(REDIRECT))
          })
        } catch(e) {
          this.props.dispatch(setError(e))
        }
      } else {
        this.props.dispatch(setExternalAction(EXTERNAL_CHAIN_START))
        this.props.dispatch(setNavigationPath(EXTERNAL_ACTION));
      }
    })
  }

  cancel() {
    this.props.dispatch(setNavigationPath(SELECT_LOGIN_ID));
  }

  render() {
    return ConsentRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    path: state.navigation.path,
    loginConsentRequest: state.rpc.loginConsentRequest,
    identities: state.identity.identities,
    activeIdentity: state.identity.activeIdentity,
    originApp: state.origin.originApp
  };
};

export default connect(mapStateToProps)(Consent);