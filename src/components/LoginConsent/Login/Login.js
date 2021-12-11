import React from 'react';
import { connect } from 'react-redux';
import { setExternalAction, setNavigationPath } from '../../../redux/reducers/navigation/navigation.actions';
import { 
  LoginRender
} from './Login.render';
import { CONSENT_TO_SCOPE, EXTERNAL_ACTION, EXTERNAL_CHAIN_START } from '../../../utils/constants'
import { checkAndUpdateIdentities, setActiveVerusId } from '../../../redux/reducers/identity/identity.actions';

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
        this.props.dispatch(setNavigationPath(CONSENT_TO_SCOPE));
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