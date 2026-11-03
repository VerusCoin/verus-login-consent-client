import React from 'react';
import {connect} from 'react-redux';
import BigNumber from 'bignumber.js';
import {
  DATA_TYPE_DEFINEDKEY,
  DefinedKey,
  GenericRequest,
  LoginConsentRequest,
} from 'verus-typescript-primitives';
import {BlockInfo} from 'verus-typescript-primitives/dist/block/BlockInfo';

import {getDetailMapEntry} from '#/features/details';
import {checkGenericRequest} from '#/features/genericRequest/genericRequest';
import {checkLoginConsentRequest} from '#/features/login/loginConsentRequest';
import {setChainMetadata} from '#/redux/reducers/chainMetadata/chainMetadata.actions';
import {DeeplinkData} from '#/redux/reducers/deeplink/deeplinkSlice';
import {setError} from '#/redux/reducers/error/error.actions';
import {setAppOrDelegatedId} from '#/redux/reducers/genericRequest/appOrDelegatedIdSlice';
import {setDefinedDataKeys} from '#/redux/reducers/genericRequest/definedDataKeysSlice';
import {
  checkAndUpdateAll,
  checkAndUpdateChainInfo,
} from '#/redux/reducers/identity/identity.actions';
import {
  navigateGenericRequest,
  setCurrentDetailIndex,
  setExternalAction,
  setNavigationPath,
} from '#/redux/reducers/navigation/navigationSlice';
import {setOriginApp} from '#/redux/reducers/origin/origin.actions';
import {completeRequest, CompleteRequestResult} from '#/redux/reducers/rpc/rpcSlice';
import {setSignatureInfo} from '#/redux/reducers/signatureInfo/signatureInfoSlice';
import store, {AppDispatch, RootState} from '#/redux/store';
import {getBlock} from '#/rpc/calls/getBlock';
import {getCurrency} from '#/rpc/calls/getCurrency';
import {getIdentity} from '#/rpc/calls/getIdentity';
import {getIdentityContent} from '#/rpc/calls/getIdentityContent';
import {getPlugin} from '#/rpc/calls/getPlugin';
import {getSignatureInfo} from '#/rpc/calls/getSignatureInfo';
import {Identity} from '#/types/identity';
import {
  API_GET_CHAIN_INFO,
  API_GET_IDENTITIES,
  CONSENT_TO_SCOPE,
  EXTERNAL_ACTION,
  EXTERNAL_CHAIN_START,
  LOGIN_CONSENT_SIG_TIME_DIFF_THRESHOLD,
  VRSC_SYSTEM_ID,
  VRSCTEST_SYSTEM_ID,
} from '#/utils/constants';
import {capitalizeString} from '#/utils/stringUtils';

import {LoginConsentRender} from './LoginConsent.render';
import {LoginConsentProps, LoginConsentState} from './types';

export class LoginConsent extends React.Component<LoginConsentProps, LoginConsentState> {
  constructor(props: LoginConsentProps) {
    super(props);

    this.state = {
      requestResult: null,
    };

    this.completeLoginConsent = this.completeLoginConsent.bind(this);
    this.getRequestResult = this.getRequestResult.bind(this);
    this.canProcessRequest = this.canProcessRequest.bind(this);
    this.handleRequest = this.handleRequest.bind(this);
    this.checkRequest = this.checkRequest.bind(this);
  }

  async componentDidUpdate(lastProps: LoginConsentProps): Promise<void> {
    if (
      lastProps !== this.props &&
      ((lastProps.rpcPassword !== this.props.rpcPassword && this.props.originAppId != null) ||
        (lastProps.originAppId !== this.props.originAppId && this.props.rpcPassword != null))
    ) {
      try {
        this.props.dispatch(
          setOriginApp(await getPlugin(this.props.originAppId, this.props.originAppBuiltin))
        );
      } catch (e) {
        this.props.dispatch(setError(e));
      }
    }

    if (lastProps !== this.props && lastProps.deeplinkData !== this.props.deeplinkData) {
      try {
        await this.handleRequest();
      } catch (e) {
        this.props.dispatch(setError(e));
      }
    }
  }

  async handleRequest(): Promise<void> {
    const request = this.props.deeplinkData;
    const mainChain = this.props.mainChain;

    // The main daemon must be running in order to check other chains.
    const chainActions = await checkAndUpdateChainInfo(mainChain);
    chainActions.map((action: unknown) => this.props.dispatch(action));

    // Add a small delay so that the Redux store is updated since
    // React 18 has concurrent rendering.
    await new Promise(resolve => setTimeout(resolve, 0));

    if (!this.canProcessRequest()) {
      this.props.dispatch(
        setChainMetadata({
          chainId: mainChain,
        })
      );
      this.props.dispatch(setExternalAction(EXTERNAL_CHAIN_START));
      this.props.dispatch(setNavigationPath(EXTERNAL_ACTION));
      return;
    }

    // The GenericRequest doesn't support a system ID to allow chains other than VRSC or VRSCTEST,
    // so use the flag to determine the chain.
    let systemId: string;
    if (request instanceof GenericRequest) {
      systemId = request.isTestnet() ? VRSCTEST_SYSTEM_ID : VRSC_SYSTEM_ID;
    } else {
      systemId = request.system_id;
    }

    const currencyInfo = await getCurrency(mainChain, systemId);
    const chainId = currencyInfo.name.toUpperCase();

    this.props.dispatch(
      setChainMetadata({
        chainName: currencyInfo.name,
        chainId: chainId,
      })
    );

    const actions = await checkAndUpdateAll(chainId);
    actions.map((action: unknown) => this.props.dispatch(action));

    if (this.canProcessRequest()) {
      await this.checkRequest(request);

      if (request instanceof LoginConsentRequest) {
        this.props.dispatch(setNavigationPath(CONSENT_TO_SCOPE));
      } else if (request instanceof GenericRequest) {
        if (request.details.length > 0) {
          // Initialize detail index to -1 to indicate no details have been processed yet.
          this.props.dispatch(setCurrentDetailIndex(-1));

          // Eagerly prepare the first detail so Consent has its data (e.g. constraints).
          // This combined with the authentication detail's positional constraints ensures that
          // it is prepared before the user is shown the consent screen.
          const firstDetail = request.details[0];
          const entry = getDetailMapEntry(firstDetail);
          await entry.prepFunction(
            firstDetail,
            0,
            this.props.dispatch as AppDispatch,
            store.getState
          );

          if (request.isSigned()) {
            // CONSENT_TO_SCOPE acts as the review for the generic request.
            this.props.dispatch(setNavigationPath(CONSENT_TO_SCOPE));
          } else {
            // Unsigned requests have no signer to review, so start at their first detail.
            await (this.props.dispatch as AppDispatch)(navigateGenericRequest());
          }
        } else {
          throw new Error('GenericRequest contains no details to process');
        }
      } else {
        throw new Error(`Unsupported deeplink type for navigation`);
      }
    } else {
      this.props.dispatch(setExternalAction(EXTERNAL_CHAIN_START));
      this.props.dispatch(setNavigationPath(EXTERNAL_ACTION));
    }
  }

  private async fetchAndStoreSignatureInfo(
    chainId: string,
    systemId: string,
    signingIdentity: Identity,
    signatureString: string,
    createdAt?: number
  ): Promise<void> {
    const sigInfo = await getSignatureInfo(
      chainId,
      systemId,
      signatureString,
      signingIdentity.identity.identityaddress
    );
    if (createdAt === undefined) {
      throw new Error(`No created timestamp found for signed request.`);
    }

    const sigBlockInfo = (await getBlock(chainId, sigInfo.height.toString())) as BlockInfo;

    if (!sigBlockInfo) {
      throw new Error(`Signature block information not found for signed request.`);
    }

    const blockTime = sigBlockInfo.time;

    if (
      BigNumber(blockTime)
        .minus(createdAt)
        .abs()
        .isGreaterThan(LOGIN_CONSENT_SIG_TIME_DIFF_THRESHOLD)
    ) {
      throw new Error(`Request signing time exceeds the valid threshold.`);
    }

    // Get the identities of the revocation and recovery i-addresses to display for anti-phishing.
    const [signingRevocationIdentity, signingRecoveryIdentity] = await Promise.all([
      getIdentity(chainId, signingIdentity.identity.revocationauthority),
      getIdentity(chainId, signingIdentity.identity.recoveryauthority),
    ]);

    this.props.dispatch(
      setSignatureInfo({
        signedBy: signingIdentity,
        sigBlockInfo,
        signingRevocationIdentity,
        signingRecoveryIdentity,
      })
    );
  }

  // Checks request for signature authenticity, and other things that would immediately disqualify
  // it. If any problems are found, an error is thrown.
  async checkRequest(req: DeeplinkData): Promise<void> {
    const chainId = this.props.chainId;
    // Verifying with Desktop's ticket is what later lets this request provision an identity.
    const {provisioningCapability} = store.getState().deeplink;

    if (req instanceof LoginConsentRequest) {
      await checkLoginConsentRequest(chainId, req, provisioningCapability);
      const signingIdentity = await getIdentity(chainId, req.signing_id);
      await this.fetchAndStoreSignatureInfo(
        chainId,
        req.system_id,
        signingIdentity,
        req.signature.signature,
        req.challenge.created_at
      );
    } else if (req instanceof GenericRequest) {
      await checkGenericRequest(chainId, req, store.getState, provisioningCapability);
      if (req.isSigned()) {
        const signingId = req.signature.identityID.toIAddress();
        const signatureString = req.signature.signatureAsVch.toString('base64');
        const systemId = req.isTestnet() ? VRSCTEST_SYSTEM_ID : VRSC_SYSTEM_ID;

        const signingIdentity = await getIdentityContent(chainId, signingId);

        await this.fetchAndStoreSignatureInfo(
          chainId,
          systemId,
          signingIdentity,
          signatureString,
          req.createdAt?.toNumber()
        );

        let definedKeyIdentity = signingIdentity;
        if (req.hasAppOrDelegatedID() && req.appOrDelegatedID.toAddress() !== signingId) {
          const appOrDelegatedIdentity = await getIdentityContent(
            chainId,
            req.appOrDelegatedID.toIAddress()
          );
          definedKeyIdentity = appOrDelegatedIdentity;
          this.props.dispatch(setAppOrDelegatedId(appOrDelegatedIdentity));
        }

        // Find the defined keys from the signing or AppOrDelegatedId.
        const definedKeySource = definedKeyIdentity.identity;
        const cmmDataKeys: Record<string, {vdxfuri: string; nsid: string; label: string}> = {};
        if (
          definedKeySource.contentmultimap &&
          definedKeySource.contentmultimap[DATA_TYPE_DEFINEDKEY.vdxfid]
        ) {
          const definedKeyContent = definedKeySource.contentmultimap[
            DATA_TYPE_DEFINEDKEY.vdxfid
          ] as string | string[];

          let definedKeyBufs: string[] = [];

          if (Array.isArray(definedKeyContent)) {
            definedKeyBufs = definedKeyContent;
          } else {
            definedKeyBufs = [definedKeyContent];
          }

          for (const definedKeyHex of definedKeyBufs) {
            try {
              const definedKey = new DefinedKey();
              definedKey.fromBuffer(Buffer.from(definedKeyHex, 'hex'));

              const iAddr = definedKey.getIAddr();
              const ns = definedKey.getNameSpaceID();

              if (ns !== definedKeySource.identityaddress) {
                throw new Error(
                  `Found defined key ${definedKey.vdxfuri} with namespace ${ns} not matching signer ID.`
                );
              } else {
                const splitUri = definedKey.vdxfuri.split('::');
                const label = splitUri.length > 1 ? splitUri[1] : splitUri[0];

                cmmDataKeys[iAddr] = {
                  vdxfuri: definedKey.vdxfuri,
                  nsid: ns,
                  label: capitalizeString(label.split('.').join(' ')),
                };
              }
            } catch (e) {
              console.warn(e);
            }
          }
        }

        this.props.dispatch(setDefinedDataKeys(cmmDataKeys));
      }
    } else {
      throw new Error(`Unsupported deeplink type`);
    }
  }

  getRequestResult(res: unknown, cb: () => void): void {
    this.setState(
      {
        requestResult: res,
      },
      () => cb()
    );
  }

  canProcessRequest(): boolean {
    return (
      this.props.apiErrors[API_GET_CHAIN_INFO] === null &&
      this.props.apiErrors[API_GET_IDENTITIES] === null &&
      this.props.chainInfo != null &&
      this.props.chainInfo.longestchain !== 0 &&
      this.props.chainInfo.longestchain === this.props.chainInfo.blocks
    );
  }

  async completeLoginConsent(result?: CompleteRequestResult, error?: Error): Promise<void> {
    this.props.dispatch(completeRequest(result, error));
  }

  render() {
    return LoginConsentRender.call(this);
  }
}

const mapStateToProps = (state: RootState): Omit<LoginConsentProps, 'dispatch'> => {
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
    deeplinkData: state.deeplink.data,
    deeplinkId: state.deeplink.id,
    chainInfo: state.identity.chainInfo,
    apiErrors: state.error.apiErrors,
    chainId: state.chainMetadata.chainId,
    chainName: state.chainMetadata.chainName,
    mainChain: state.chainMetadata.mainChain,
    signatureInfo: state.signatureInfo,
  };
};

export default connect(mapStateToProps)(LoginConsent);
