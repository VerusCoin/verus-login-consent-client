import React from 'react';
import { connect } from 'react-redux';
import { ProvisionIdentityResultRender } from './ProvisionIdentityResult.render';
import { PROVISIONING_CONFIRM, SELECT_LOGIN_ID } from '../../../../utils/constants';
import { setNavigationPath } from '../../../../redux/reducers/navigation/navigation.actions';

class ProvisionIdentityResult extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    }

    this.finishSend = this.finishSend.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  finishSend() {
    this.props.dispatch(setNavigationPath(SELECT_LOGIN_ID));
  }

  cancel() {
    this.props.dispatch(setNavigationPath(PROVISIONING_CONFIRM));
  }

  render() {
    return ProvisionIdentityResultRender.call(this);
  }
}

// TODO: Figure out if this should be different
const mapStateToProps = (state) => {
  return {
    path: state.navigation.path,
    loginConsentRequest: state.rpc.loginConsentRequest,
    identities: state.identity.identities,
    activeIdentity: state.identity.activeIdentity,
    originApp: state.origin.originApp
  };
};

export default connect(mapStateToProps)(ProvisionIdentityResult);