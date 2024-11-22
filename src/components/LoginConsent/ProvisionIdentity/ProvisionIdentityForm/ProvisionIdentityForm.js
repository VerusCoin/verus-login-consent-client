import React from 'react';
import { connect } from 'react-redux';
import { ProvisionIdentityFormRender } from './ProvisionIdentityForm.render';
import { PROVISIONING_CONFIRM, SELECT_LOGIN_ID } from '../../../../utils/constants';
import { setNavigationPath } from '../../../../redux/reducers/navigation/navigation.actions';

class ProvisionIdentityForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    }

    this.submitData = this.submitData.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  submitData() {
    this.props.dispatch(setNavigationPath(PROVISIONING_CONFIRM));
  }

  cancel() {
    this.props.dispatch(setNavigationPath(SELECT_LOGIN_ID));
  }

  render() {
    return ProvisionIdentityFormRender.call(this);
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

export default connect(mapStateToProps)(ProvisionIdentityForm);