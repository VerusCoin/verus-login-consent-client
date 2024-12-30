import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PROVISIONING_FORM, SELECT_LOGIN_ID } from '../../../../utils/constants';
import { setNavigationPath } from '../../../../redux/reducers/navigation/navigation.actions';
import { setIdentities } from '../../../../redux/reducers/identity/identity.actions';
import { VerusIdLogo } from '../../../../images';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useInterval } from '../../../../utils/interval';
import axios from 'axios';
import {
  LOGIN_CONSENT_PROVISIONING_ERROR_KEY_CREATION_FAILED,
  LOGIN_CONSENT_PROVISIONING_ERROR_KEY_NAMETAKEN,
  LOGIN_CONSENT_PROVISIONING_RESULT_STATE_FAILED,
  LoginConsentProvisioningResponse
} from 'verus-typescript-primitives';
import { loadIdentities } from '../../../../rpc/calls/identities';
import { verifyIdProvisioningResponse } from '../../../../rpc/calls/verifyIdProvisioningResponse';
import { setIdentityToProvisionField, setPrimaryAddress } from '../../../../redux/reducers/provision/provision.actions';

export const checkForProvisioningStatus = async (
  infoUri,
  request,
  setCheckForId,
  setProvisioningError,
  setCheckForProvisioningStatus,
) => {
  const failed = (description, allowRetry) => {
    setCheckForId(false);
    setCheckForProvisioningStatus(false);
    setProvisioningError({
      error: true,
      description: description,
      allowRetry: allowRetry,
    });
  };

  if (!infoUri) {
    failed('Provisioning timed out with no response from the provisioning service.', false);
    return;
  }
  
  try {
    const res = await axios.get(infoUri);
    const provisioningResponse = new LoginConsentProvisioningResponse(res.data);
    const verificationCheck = await verifyIdProvisioningResponse(provisioningResponse);
    const verified = verificationCheck.verified;

    if (provisioningResponse.signing_id !== request.signing_id || !verified) {
      throw new Error('Failed to verify response from the provisioning service.');
    }

    if (provisioningResponse.decision.result.state === LOGIN_CONSENT_PROVISIONING_RESULT_STATE_FAILED.vdxfid) {
      if (provisioningResponse.decision.result.error_key === LOGIN_CONSENT_PROVISIONING_ERROR_KEY_NAMETAKEN.vdxfid) {
        failed('Name is already taken.', true);
      } else if (provisioningResponse.decision.result.error_key === LOGIN_CONSENT_PROVISIONING_ERROR_KEY_CREATION_FAILED.vdxfid) {
        failed('Unable to register the identity.', true);
      } else {
        failed('Provisioning failed for unknown reasons.', true);
      }
    }
  } catch (e) {
    if (e.message === 'Network Error') {
      failed('Failed to get a response from the provisioning service.', false);
    } else {
      failed(e.message, false);
    }
  }
};

export const checkForNewId = async (
  dispatch,
  chainId,
  requestedId,
  setCheckForId,
  setCheckForProvisioningStatus
) => {
  try {
    const identities = await loadIdentities(chainId);
    dispatch(setIdentities(identities));
    const found = identities.find(id => {
      return id.identity.identityaddress === requestedId;
    });

    if (found) {
      setCheckForId(false);
      setCheckForProvisioningStatus(false);
    }
  } catch (e) {
    console.error(e);
  }
};

const ProvisionIdentityResult = () => {
  const dispatch = useDispatch();

  const { request } = useSelector((state) => state.rpc.loginConsentRequest);
  const provisioningResponse = useSelector((state) => state.provision.provisioningResponse);
  const requestedFqn = useSelector((state) => state.provision.requestedFqn);
  const requestedId = useSelector((state) => state.provision.requestedId);
  const provisioningName = useSelector((state) => state.provision.provisioningName);
  const provisioningCheckDelay = 600000; // Ten minute delay.
  const idCheckDelay = 5000; // 5 second delay.

  let formattedName = '';
  const lastDotIndex = requestedFqn.lastIndexOf('.');
  if (lastDotIndex === -1) formattedName = requestedFqn; // return the original string if there's no dot
  else formattedName = requestedFqn.substring(0, lastDotIndex);

  const [checkForId, setCheckForId] = useState(true);
  const [checkProvisioningStatus, setCheckForProvisioningStatus] = useState(true);
  const [provisioningError, setProvisioningError] = useState({
    error: false,
    description: '',
    allowRetry: false,
  });

  useInterval(
    async () => await checkForProvisioningStatus(
      provisioningResponse.decision.result.info_uri,
      request,
      setCheckForId,
      setProvisioningError,
      setCheckForProvisioningStatus,
    ),
    checkProvisioningStatus ? provisioningCheckDelay : null,
  );

  useInterval(
    async () => await checkForNewId(
      dispatch,
      request.chainTicker,
      requestedId,
      setCheckForId,
      setCheckForProvisioningStatus,
    ),
    checkForId ? idCheckDelay : null,
  ); 

  const finishSend = () => {
    // Clear the chosen name and address after leaving.
    dispatch(setIdentityToProvisionField(''));
    dispatch(setPrimaryAddress(''));
    dispatch(setNavigationPath(SELECT_LOGIN_ID));
  };

  const retry = () => {
    // Clear the chosen name before choosing a new one.
    dispatch(setIdentityToProvisionField(''));
    dispatch(setNavigationPath(PROVISIONING_FORM));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
      }}
    >
      <div
        style={{
          height: '100%',
          display: 'flex',
          padding: 32,
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <img src={VerusIdLogo} width={'55%'} height={'10%'}/>
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              padding: 8,
            }}
          >
            <Box>
              {`${formattedName}@ is being provisioned by ${provisioningName}@`}
            </Box>
            <Box>
              {`Estimated waiting time is 5 minutes`}
            </Box>
          </div>
        </div>

        <Box sx={{ 
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          {checkForId ? 
            <CircularProgress /> :
            provisioningError.error ?
              <ErrorIcon color='secondary' sx={{ fontSize: 72 }} /> 
              :
              <CheckCircleIcon color='success' sx={{ fontSize: 72 }} /> 
          }
          {!checkForId && provisioningError.error ? provisioningError.description : ``}
        </Box>

        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {provisioningError.error ?
              <Box>
                {provisioningError.allowRetry &&
                  <Button
                    variant='text'
                    disabled={checkForId}
                    color='secondary'
                    onClick={() => retry()}
                    style={{
                      width: 120,
                      marginRight: 32,
                      padding: 8,
                    }}
                  >
                    {'Retry'}
                  </Button>
                }
                <Button
                  variant='contained'
                  color='secondary'
                  disabled={checkForId}
                  onClick={() => finishSend()}
                  style={{
                    width: 120,
                    padding: 8,
                  }}
                >
                  {'Exit'}
                </Button>
              </Box>
              :
              <Button
                variant='contained'
                color={'success'}
                disabled={checkForId}
                onClick={() => finishSend()}
                style={{
                  width: 120,
                  padding: 8,
                }}
              >
                {'Done'}
              </Button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvisionIdentityResult;