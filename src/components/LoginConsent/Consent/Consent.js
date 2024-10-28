import React from 'react';
import { connect } from 'react-redux';
import { setExternalAction, setNavigationPath } from '../../../redux/reducers/navigation/navigation.actions';
import { 
  ConsentRender
} from './Consent.render';
import { EXTERNAL_ACTION, EXTERNAL_CHAIN_START, SCOPES, SELECT_LOGIN_ID } from '../../../utils/constants';
import { checkAndUpdateIdentities } from '../../../redux/reducers/identity/identity.actions';

class Consent extends React.Component {
  constructor(props) {
    super(props);
    const requestedPermissions = props.loginConsentRequest.request.challenge.requested_access
    const chainName = props.loginConsentRequest.request.chainName
    const signedBy = props.loginConsentRequest.request.signedBy
    const friendlyName = signedBy.friendlyname
    this.displayName = friendlyName.substring(0, friendlyName.lastIndexOf("." + chainName))

    let permissionsDescriptions = []

    if (requestedPermissions != null) {
      // Match permissions to the possible ids in the scopes.
      for (const permission of requestedPermissions) {
        if (SCOPES[permission.vdxfkey]) {
          permissionsDescriptions.push(SCOPES[permission.vdxfkey].description);
        }
      }
    }

    this.state = {
      loading: false
    }

    this.tryLogin = this.tryLogin.bind(this);
    this.cancel = this.cancel.bind(this);
    this.permissionsText = permissionsDescriptions.join(", ");
  }

  tryLogin() {
    this.setState({ loading: true }, async () => {
      const { request } = this.props.loginConsentRequest
      const userActions = await checkAndUpdateIdentities(request.chainTicker)
      userActions.map(action => this.props.dispatch(action))

      if (this.props.canLoginOrGiveConsent()) {
        this.props.dispatch(setNavigationPath(SELECT_LOGIN_ID));
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