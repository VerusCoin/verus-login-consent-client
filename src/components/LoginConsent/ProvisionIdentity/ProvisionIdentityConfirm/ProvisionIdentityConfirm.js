import React from 'react';
import { connect } from 'react-redux';
import { ProvisionIdentityConfirmRender } from './ProvisionIdentityConfirm.render';
import { PROVISIONING_FORM, PROVISIONING_RESULT } from '../../../../utils/constants';
import { setNavigationPath } from '../../../../redux/reducers/navigation/navigation.actions';

class ProvisionIdentityConfirm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    }

    console.log(props.loginConsentRequest)
    console.log(props.provisioningInfo)

    this.submitData = this.submitData.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  submitData() {
    this.props.dispatch(setNavigationPath(PROVISIONING_RESULT));
  }

  cancel() {
    this.props.dispatch(setNavigationPath(PROVISIONING_FORM));
  }

  render() {
    return ProvisionIdentityConfirmRender.call(this);
  }
}

// TODO: Figure out if this should be different
const mapStateToProps = (state) => {
  return {
    path: state.navigation.path,
    loginConsentRequest: state.rpc.loginConsentRequest,
    identities: state.identity.identities,
    activeIdentity: state.identity.activeIdentity,
    originApp: state.origin.originApp,
    provisioningInfo: state.provision.provisioningInfo
  };
};

export default connect(mapStateToProps)(ProvisionIdentityConfirm);