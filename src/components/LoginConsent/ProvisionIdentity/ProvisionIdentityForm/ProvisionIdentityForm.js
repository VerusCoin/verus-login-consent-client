import React from 'react';
import { connect } from 'react-redux';
import { ProvisionIdentityFormRender } from './ProvisionIdentityForm.render';
import { PROVISIONING_CONFIRM, SELECT_LOGIN_ID } from '../../../../utils/constants';
import { setNavigationPath } from '../../../../redux/reducers/navigation/navigation.actions';
import { 
  ID_ADDRESS_VDXF_KEY,
  ID_SYSTEMID_VDXF_KEY,
  ID_FULLYQUALIFIEDNAME_VDXF_KEY,
  ID_PARENT_VDXF_KEY,
  LOGIN_CONSENT_ID_PROVISIONING_WEBHOOK_VDXF_KEY,
} from 'verus-typescript-primitives';

class ProvisionIdentityForm extends React.Component {
  constructor(props) {
    super(props);

    const { request } = props.loginConsentRequest;

    const hasProvisioningInfo = request != null && request.challenge.provisioning_info != null;

    this.state = {
      loading: false,
      assignedIdentity: null,
      hasProvisioningInfo: hasProvisioningInfo,
    };

    this.submitData = this.submitData.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  componentDidMount() {
    const { request } = this.props.loginConsentRequest;
    const provInfo = updateProvisioningInfoProcessedData(request);
    this.setState(provInfo, () => console.log(this.state));
    const {provAddress, provSystemId, provFqn, provParent, provWebhook} = provInfo;
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

const hasProvisioningInfo = (request) => {
  return request != null && request.challenge.provisioning_info != null;
}

const updateProvisioningInfoProcessedData = (request) => {
  if (!hasProvisioningInfo(request)) return;

  const findProvisioningInfo = (key) =>
    request.challenge.provisioning_info.find(
      (x) => x.vdxfkey === key.vdxfid
    );

  const provAddress = findProvisioningInfo(ID_ADDRESS_VDXF_KEY);
  const provSystemId = findProvisioningInfo(ID_SYSTEMID_VDXF_KEY);
  const provFqn = findProvisioningInfo(ID_FULLYQUALIFIEDNAME_VDXF_KEY);
  const provParent = findProvisioningInfo(ID_PARENT_VDXF_KEY);
  const provWebhook = findProvisioningInfo(LOGIN_CONSENT_ID_PROVISIONING_WEBHOOK_VDXF_KEY);

  return {
    provAddress: provAddress,
    provSystemId: provSystemId,
    provFqn: provFqn,
    provParent: provParent,
    provWebhook: provWebhook,
  };
};

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