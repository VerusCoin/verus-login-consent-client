import React from 'react';
import { connect } from 'react-redux';
import { LoginConsentRequest } from 'verus-typescript-primitives';
import { setError } from '../../redux/reducers/error/error.actions';
import { checkAndUpdateAll, checkAndUpdateChainInfo } from '../../redux/reducers/identity/identity.actions';
import { setExternalAction, setNavigationPath } from '../../redux/reducers/navigation/navigation.actions';
import { setOriginApp } from '../../redux/reducers/origin/origin.actions';
import { setRpcLoginConsentRequest } from '../../redux/reducers/rpc/rpc.actions';
import { closePlugin } from '../../rpc/calls/closePlugin';
import { getPlugin } from '../../rpc/calls/getPlugin';
import { verifyRequest } from '../../rpc/calls/verifyRequest';
import {
  API_GET_CHAIN_INFO,
  API_GET_IDENTITIES,
  EXTERNAL_ACTION,
  EXTERNAL_CHAIN_START,
  CONSENT_TO_SCOPE,
  SUPPORTED_SCOPES,
  VERUS_LOGIN_CONSENT_UI,
} from "../../utils/constants";
import { 
  LoginConsentRender
} from './LoginConsent.render';
import { getIdentity } from '../../rpc/calls/getIdentity';
import { getSignatureInfo } from '../../rpc/calls/getSignatureInfo';
import { getBlock } from '../../rpc/calls/getBlock';
import { getCurrency } from '../../rpc/calls/getCurrency';

class LoginConsent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      requestResult: null
    }

    this.completeLoginConsent = this.completeLoginConsent.bind(this)
    this.getRequestResult = this.getRequestResult.bind(this)
    this.canLoginOrGiveConsent = this.canLoginOrGiveConsent.bind(this)
    this.handleRequest = this.handleRequest.bind(this)
    this.checkRequest = this.checkRequest.bind(this)
  }

  async componentDidUpdate(lastProps) {
    if (
      lastProps !== this.props &&
      ((lastProps.rpcPassword !== this.props.rpcPassword &&
        this.props.originAppId != null) ||
        (lastProps.originAppId !== this.props.originAppId &&
          this.props.rpcPassword != null))
    ) {
      try {
        this.props.dispatch(
          setOriginApp(
            await getPlugin(this.props.originAppId, this.props.originAppBuiltin)
          )
        );
      } catch (e) {
        this.props.dispatch(setError(e));
      }
    }

    if (
      lastProps !== this.props &&
      lastProps.loginConsentRequest.request !== this.props.loginConsentRequest.request
    ) {
      await this.handleRequest();
    }
  }

  async handleRequest() {
    let { request } = this.props.loginConsentRequest;

      const mainChain = request.mainChain;

      // Check if the main daemon is running.
      const chainActions = await checkAndUpdateChainInfo(mainChain);
      chainActions.map((action) => this.props.dispatch(action));

      request.chainTicker = mainChain;

      if (!this.canLoginOrGiveConsent()) {
        this.props.dispatch(setRpcLoginConsentRequest({
          request: request
        }));
        this.props.dispatch(setExternalAction(EXTERNAL_CHAIN_START));
        this.props.dispatch(setNavigationPath(EXTERNAL_ACTION));
        return;
      }

      // Get information on the system of the request.
      const currencyInfo = await getCurrency(mainChain, request.system_id);

      request.chainName = currencyInfo.name;
      request.chainTicker = currencyInfo.name.toUpperCase();

      const actions = await checkAndUpdateAll(request.chainTicker);
      actions.map((action) => this.props.dispatch(action));

      if (this.canLoginOrGiveConsent()) {
        this.props.dispatch(setRpcLoginConsentRequest({
          request: request
        }));

        await this.checkRequest(request);

        this.props.dispatch(setNavigationPath(CONSENT_TO_SCOPE));
      } else {
        this.props.dispatch(setExternalAction(EXTERNAL_CHAIN_START));
        this.props.dispatch(setNavigationPath(EXTERNAL_ACTION));
      }
  }

  // Checks request for signature authenticity, and other things that would immediately disqualify
  // it. If any problems are found, an error is thrown.
  async checkRequest(req) {
    try {
      // Typescript sanity check
      const request = new LoginConsentRequest(req);

      if (request.challenge.context != null) {
        if (Object.keys(request.challenge.context.kv).length !== 0) {
          throw new Error("Login requests with context are currently unsupported.");
        }
      }
      
      // Check request signature
      const verificatonCheck = await verifyRequest(req);

      if (!verificatonCheck.verified) {
        throw new Error(verificatonCheck.message);
      }

      for (const requestedPermission of request.challenge.requested_access) {
        if (!SUPPORTED_SCOPES.includes(requestedPermission.vdxfkey)) {
          throw new Error(
            'Unrecognized requested permission ' +
              requestedPermission.vdxfkey,
          );
        }
      }

      if (request.challenge.requested_access.length == 0) {
        throw new Error(
          'No permissions being requested in loginconsent request.',
        );
      }

      // Get the signing identity for displaying later.
      const signedBy = await getIdentity(req.chainTicker, request.signing_id);
      req.signedBy = signedBy;

      // Get information on the signature for displaying later.
      const sigInfo = await getSignatureInfo(req.chainTicker, request.system_id, request.signature.signature, signedBy.identity.identityaddress);
      const sigBlockInfo = await getBlock(req.chainTicker, sigInfo.height.toString());
      req.sigBlockInfo = sigBlockInfo;

      // Get the identities of the revocation and recovery i-addresses to display for anti-phishing.
      const signingRevocationIdentity  = await getIdentity(req.chainTicker, signedBy.identity.revocationauthority);
      req.signingRevocationIdentity = signingRevocationIdentity;

      const signingRecoveryIdentity = await getIdentity(req.chainTicker, signedBy.identity.recoveryauthority);
      req.signingRecoveryIdentity = signingRecoveryIdentity;

      this.props.dispatch(setRpcLoginConsentRequest({
        request: req
      }));

    } catch(e) {
      console.error(e)
      this.props.dispatch(setError(new Error(e.message)));
    }
  }

  getRequestResult(res, cb) {
    this.setState({
      requestResult: res
    }, () => cb())
  }

  canLoginOrGiveConsent() {
    return (
      this.props.apiErrors[API_GET_CHAIN_INFO] === null &&
      this.props.apiErrors[API_GET_IDENTITIES] === null &&
      this.props.chainInfo != null &&
      this.props.chainInfo.longestchain !== 0 &&
      this.props.chainInfo.longestchain === this.props.chainInfo.blocks
    );
  }

  async completeLoginConsent(result = null, error = null) {
    try {
      await closePlugin(
        VERUS_LOGIN_CONSENT_UI,
        this.props.windowId,
        true,
        result != null
          ? result
          : { error: error != null ? error.message : error }
      );
    } catch(e) {
      this.props.dispatch(setError(e))
    }
  } 

  render() {
    return LoginConsentRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    path: state.navigation.path,
    pathArray: state.navigation.pathArray,
    port: state.rpc.port,
    originAppId: state.origin.originAppId,
    originApp: state.origin.originApp,
    originAppBuiltin: state.origin.originAppBuiltin,
    error: state.error.error,
    rpcPassword: state.rpc.password,
    windowId: state.rpc.windowId,
    loginConsentRequest: state.rpc.loginConsentRequest,
    chainInfo: state.identity.chainInfo,
    apiErrors: state.error.apiErrors
  };
};

export default connect(mapStateToProps)(LoginConsent);