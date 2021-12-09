import React from 'react';
import { connect } from 'react-redux';
import { setExternalAction, setNavigationPath } from '../../../redux/reducers/navigation/navigation.actions';
import { 
  LoginRender
} from './Login.render';
import { EXTERNAL_ACTION, EXTERNAL_CHAIN_START, REDIRECT } from '../../../utils/constants'
import { checkAndUpdateIdentities, setActiveVerusId } from '../../../redux/reducers/identity/identity.actions';
import { signResponse } from '../../../rpc/calls/signResponse';
import { setError } from '../../../redux/reducers/error/error.actions';
import { LoginConsentDecision, LoginConsentRequest, LoginConsentResponse } from 'verus-typescript-primitives';

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
      const userActions = await checkAndUpdateIdentities(request.chain_id)
      userActions.map(action => this.props.dispatch(action))

      if (this.props.canLoginOrGiveConsent()) {
        try {
          const response = new LoginConsentResponse({
            chain_id: request.chain_id,
            signing_id: this.props.activeIdentity.identity.identityaddress,
            decision: new LoginConsentDecision({
              subject: this.props.activeIdentity.identity.identityaddress,
              remember: false,
              remember_for: 0,
              request: request
            }),
          });
          
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
    this.setState({ loading: true }, async () => {
      await this.props.completeLoginConsent()
    })
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