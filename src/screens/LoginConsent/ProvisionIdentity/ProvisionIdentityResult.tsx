import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import {
  GenericRequest,
  LOGIN_CONSENT_PROVISIONING_ERROR_KEY_CREATION_FAILED,
  LOGIN_CONSENT_PROVISIONING_ERROR_KEY_NAMETAKEN,
  LOGIN_CONSENT_PROVISIONING_RESULT_STATE_FAILED,
  LoginConsentProvisioningDecision,
  LoginConsentProvisioningResponse,
  LoginConsentRequest,
} from 'verus-typescript-primitives';

import PageLayout from '#/components/PageLayout';
import {
  extractProvisioningRequestContextV1,
  extractGenericProvisioningRequestContext,
} from '#/features/login/provisionIdentityDataExtractors';
import {useAppDispatch} from '#/redux/hooks';
import {setIdentities, setActiveVerusId} from '#/redux/reducers/identity/identity.actions';
import {
  navigateBackGenericRequest,
  navigateGenericRequest,
  setNavigationPath,
} from '#/redux/reducers/navigation/navigationSlice';
import {
  setIdentityToProvisionField,
  setPrimaryAddress,
} from '#/redux/reducers/provision/provisionSlice';
import {RootState} from '#/redux/store';
import {loadIdentities} from '#/rpc/calls/identities';
import {getIdProvisioningStatus} from '#/rpc/calls/provisioningTransport';
import {verifyIdProvisioningResponse} from '#/rpc/calls/verifyIdProvisioningResponse';
import {PROVISIONING_FORM, SELECT_LOGIN_ID} from '#/utils/constants';
import {useInterval} from '#/utils/interval';

interface ProvisioningError {
  error: boolean;
  description: string;
  allowRetry: boolean;
}

type SetCheckForId = React.Dispatch<React.SetStateAction<boolean>>;
type SetProvisioningError = React.Dispatch<React.SetStateAction<ProvisioningError>>;
type SetCheckForProvisioningStatus = React.Dispatch<React.SetStateAction<boolean>>;

export const checkForProvisioningStatus = async (
  infoUri: string | undefined,
  provisioningCapability: string | null,
  signerId: string,
  setCheckForId: SetCheckForId,
  setProvisioningError: SetProvisioningError,
  setCheckForProvisioningStatus: SetCheckForProvisioningStatus
): Promise<void> => {
  const failed = (description: string, allowRetry: boolean) => {
    setCheckForId(false);
    setCheckForProvisioningStatus(false);
    setProvisioningError({error: true, description, allowRetry});
  };

  if (!infoUri) {
    failed('Provisioning timed out with no response from the provisioning service.', false);
    return;
  }

  try {
    if (provisioningCapability == null) {
      throw new Error(
        'The secure provisioning session is unavailable. Please restart the request.'
      );
    }
    // Desktop reads the status URI the provisioning service returned for this ticket.
    const response = await getIdProvisioningStatus(provisioningCapability, infoUri);
    const provisioningResponse = new LoginConsentProvisioningResponse(response);
    const verificationCheck = await verifyIdProvisioningResponse(provisioningResponse);
    const verified = verificationCheck.verified;

    if (provisioningResponse.signing_id !== signerId || !verified) {
      throw new Error('Failed to verify response from the provisioning service.');
    }

    const decision = provisioningResponse.decision as LoginConsentProvisioningDecision;
    const result = decision.result;

    if (result?.state === LOGIN_CONSENT_PROVISIONING_RESULT_STATE_FAILED.vdxfid) {
      if (result.error_key === LOGIN_CONSENT_PROVISIONING_ERROR_KEY_NAMETAKEN.vdxfid) {
        failed('Name is already taken.', true);
      } else if (result.error_key === LOGIN_CONSENT_PROVISIONING_ERROR_KEY_CREATION_FAILED.vdxfid) {
        failed('Unable to register the identity.', true);
      } else {
        failed('Provisioning failed for unknown reasons.', true);
      }
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    if (message === 'Network Error') {
      failed('Failed to get a response from the provisioning service.', false);
    } else {
      failed(message, false);
    }
  }
};

export const checkForNewId = async (
  dispatch: ReturnType<typeof useAppDispatch>,
  chainId: string,
  requestedId: string,
  setCheckForId: SetCheckForId,
  setCheckForProvisioningStatus: SetCheckForProvisioningStatus
): Promise<void> => {
  try {
    const identities = await loadIdentities(chainId);
    dispatch(setIdentities(identities));
    const found = identities.find(
      (id: {identity: {identityaddress: string}}) => id.identity.identityaddress === requestedId
    );

    if (found) {
      setCheckForId(false);
      setCheckForProvisioningStatus(false);
    }
  } catch (e) {
    console.error(e);
  }
};

const ProvisionIdentityResult: React.FC = () => {
  const dispatch = useAppDispatch();

  const deeplinkData = useSelector((state: RootState) => state.deeplink.data);
  const provisioningCapability = useSelector(
    (state: RootState) => state.deeplink.provisioningCapability
  );
  const chainId = useSelector((state: RootState) => state.chainMetadata.chainId);
  const provisioningResponse = useSelector(
    (state: RootState) => state.provision.provisioningResponse
  );
  const requestedFqn = useSelector((state: RootState) => state.provision.requestedFqn);
  const requestedId = useSelector((state: RootState) => state.provision.requestedId);
  const provisioningName = useSelector((state: RootState) => state.provision.provisioningName);
  const identities = useSelector((state: RootState) => state.identity.identities);
  const isGenericRequest = deeplinkData instanceof GenericRequest;
  const {signerId} = isGenericRequest
    ? extractGenericProvisioningRequestContext(deeplinkData)
    : extractProvisioningRequestContextV1(deeplinkData as LoginConsentRequest);

  const provisioningCheckDelay = 600000;
  const idCheckDelay = 5000;

  let formattedName = '';
  const lastDotIndex = requestedFqn.lastIndexOf('.');
  if (lastDotIndex === -1) formattedName = requestedFqn;
  else formattedName = requestedFqn.substring(0, lastDotIndex);

  const [checkForId, setCheckForId] = useState(true);
  const [checkProvisioningStatus, setCheckForProvisioningStatus] = useState(true);
  const [provisioningError, setProvisioningError] = useState<ProvisioningError>({
    error: false,
    description: '',
    allowRetry: false,
  });

  useInterval(
    async () =>
      await checkForProvisioningStatus(
        provisioningResponse?.decision?.result?.info_uri,
        provisioningCapability,
        signerId,
        setCheckForId,
        setProvisioningError,
        setCheckForProvisioningStatus
      ),
    checkProvisioningStatus ? provisioningCheckDelay : null
  );

  useInterval(
    async () =>
      await checkForNewId(
        dispatch,
        chainId,
        requestedId,
        setCheckForId,
        setCheckForProvisioningStatus
      ),
    checkForId ? idCheckDelay : null
  );

  const finishSend = (): void => {
    const newIdentity = identities.find(
      (id: {identity: {identityaddress: string}}) => id.identity.identityaddress === requestedId
    );
    if (newIdentity) dispatch(setActiveVerusId(newIdentity));

    dispatch(setIdentityToProvisionField(''));
    dispatch(setPrimaryAddress(''));
    if (isGenericRequest) {
      dispatch(navigateGenericRequest());
    } else {
      dispatch(setNavigationPath(SELECT_LOGIN_ID));
    }
  };

  const retry = (): void => {
    dispatch(setIdentityToProvisionField(''));
    if (isGenericRequest) {
      dispatch(navigateBackGenericRequest());
    } else {
      dispatch(setNavigationPath(PROVISIONING_FORM));
    }
  };

  const footerButtons = provisioningError.error ? (
    <>
      {provisioningError.allowRetry && (
        <Button
          variant="text"
          disabled={checkForId}
          color="secondary"
          onClick={retry}
          sx={{width: 120, mr: 4, p: 1}}
        >
          Retry
        </Button>
      )}
      <Button
        variant="contained"
        color="secondary"
        disabled={checkForId}
        onClick={finishSend}
        sx={{width: 120, p: 1}}
      >
        Exit
      </Button>
    </>
  ) : (
    <Button
      variant="contained"
      color="success"
      disabled={checkForId}
      onClick={finishSend}
      sx={{width: 120, p: 1}}
    >
      Done
    </Button>
  );

  return (
    <PageLayout
      title={`${formattedName}@ is being provisioned by ${provisioningName}@`}
      contentStyle={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
      footerContent={footerButtons}
    >
      <Typography color="text.secondary" sx={{textAlign: 'center', mb: 2}}>
        Estimated waiting time is 5 minutes
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {checkForId ? (
          <CircularProgress />
        ) : provisioningError.error ? (
          <>
            <ErrorIcon color="secondary" sx={{fontSize: 72}} />
            <Typography color="error" sx={{mt: 2, textAlign: 'center'}}>
              {provisioningError.description}
            </Typography>
          </>
        ) : (
          <CheckCircleIcon color="success" sx={{fontSize: 72}} />
        )}
      </Box>
    </PageLayout>
  );
};

export default ProvisionIdentityResult;
