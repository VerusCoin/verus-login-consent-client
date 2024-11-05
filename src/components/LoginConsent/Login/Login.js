import React from 'react';
import { connect } from 'react-redux';
import { setExternalAction, setNavigationPath } from '../../../redux/reducers/navigation/navigation.actions';
import { 
  LoginRender
} from './Login.render';
import { CONSENT_TO_SCOPE, EXTERNAL_ACTION, EXTERNAL_CHAIN_START, REDIRECT } from '../../../utils/constants'
import { checkAndUpdateIdentities, setActiveVerusId } from '../../../redux/reducers/identity/identity.actions';
import { signResponse } from '../../../rpc/calls/signResponse';
import { setError } from '../../../redux/reducers/error/error.actions';
import { LoginConsentDecision, LoginConsentResponse } from 'verus-typescript-primitives';
import BigNumber from 'bignumber.js';

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    }

    this.tryLogin = this.tryLogin.bind(this);
    this.selectId = this.selectId.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  tryLogin() {
    this.setState({ loading: true }, async () => {
      const { request } = this.props.loginConsentRequest
      const userActions = await checkAndUpdateIdentities(request.chainTicker)
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
  
          response.chainTicker = request.chainTicker
          
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
    this.props.dispatch(setNavigationPath(CONSENT_TO_SCOPE));
  }

  selectId(address) {
    this.props.dispatch(
      setActiveVerusId(
        address.length == 0
          ? null
          : this.props.identities.find((x) => address === x.identity.identityaddress)
      )
    );
  }

  render() {
    return LoginRender.call(this);
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

export default connect(mapStateToProps)(Login);