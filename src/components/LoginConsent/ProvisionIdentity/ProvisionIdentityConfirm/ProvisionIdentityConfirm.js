import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PROVISIONING_FORM, PROVISIONING_RESULT } from '../../../../utils/constants';
import { setNavigationPath } from '../../../../redux/reducers/navigation/navigation.actions';
import Button from '@mui/material/Button';
import { VerusIdLogo } from '../../../../images';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import {
  LOGIN_CONSENT_ID_PROVISIONING_WEBHOOK_VDXF_KEY,
  LoginConsentProvisioningRequest,
  LoginConsentProvisioningChallenge,
  LoginConsentRequest,
  fromBase58Check,
  LoginConsentProvisioningResponse,
  LOGIN_CONSENT_PROVISIONING_RESULT_STATE_FAILED,
  LOGIN_CONSENT_PROVISIONING_RESULT_STATE_PENDINGAPPROVAL,
  LOGIN_CONSENT_PROVISIONING_RESULT_STATE_COMPLETE,
} from 'verus-typescript-primitives';
import { getIdentity } from '../../../../rpc/calls/getIdentity';
import { getVdxfId } from '../../../../rpc/calls/getVdxfId';
import { signIdProvisioningRequest } from '../../../../rpc/calls/signIdProvisioningRequest';
import axios from 'axios';
import { SnackbarAlert } from '../../../../containers/SnackbarAlert';
import { verifyIdProvisioningResponse } from '../../../../rpc/calls/verifyIdProvisioningResponse';
import {
  setProvisioningName,
  setProvisioningResponse,
  setRequestedFqn,
  setRequestedId
} from '../../../../redux/reducers/provision/provision.actions';

const ProvisionIdentityConfirm = () => {
  const dispatch = useDispatch();
  const { request } = useSelector((state) => state.rpc.loginConsentRequest);
  const provisioningInfo = useSelector((state) => state.provision.provisioningInfo);
  const identityToProvisionField = useSelector((state) => state.provision.identityToProvisionField);

  const {
    primaryAddress,
    provAddress,
    provSystemId,
    provFqn,
    provParent,
    friendlyNameMap,
  } = provisioningInfo;

  let displayIdentity;
  
  if (provFqn) {
    displayIdentity = provFqn.data;
  } else {
    if (friendlyNameMap[identityToProvisionField]) {
      displayIdentity = `${friendlyNameMap[identityToProvisionField]}@`;
    } else {
      displayIdentity = identityToProvisionField;
    }
  }

  let displayParent;

  if (provParent != null) {
    if (friendlyNameMap[provParent.data]) {
      displayParent = friendlyNameMap[provParent.data];
    } else {
      displayParent = provParent.data;
    }
  } else {
    displayParent = null;
  }

  let displaySystemid;

  if (provSystemId != null) {
    if (friendlyNameMap[provSystemId.data]) {
      displaySystemid = friendlyNameMap[provSystemId.data];
    } else {
      displaySystemid = provSystemId.data;
    }
  } else {
    displaySystemid = null;
  }
  
  const [loading, setLoading] = useState(false);

  const [submissionError, setSubmissionError] = useState({
    showError: false,
    description: '' 
  });

  const handleProvisioningResponse = async (response, requestedId, requestedFqn) => {
    const res = new LoginConsentProvisioningResponse(response);
    
    // Check the response to see if it is valid and if there are errors.
    const verificationCheck = await verifyIdProvisioningResponse(res);
    const verified = verificationCheck.verified;
  
    if (!verified) throw new Error('Failed to verify response from the provisioning service.');
  
    const {decision} = res;
    const {result} = decision;
    const {
      error_desc,
      state,
    } = result;
  
    if (state === LOGIN_CONSENT_PROVISIONING_RESULT_STATE_FAILED.vdxfid) {
      throw new Error(error_desc);
    } else if (state === LOGIN_CONSENT_PROVISIONING_RESULT_STATE_PENDINGAPPROVAL.vdxfid ||
      state === LOGIN_CONSENT_PROVISIONING_RESULT_STATE_COMPLETE.vdxfid) { 
  
      if (!result.identity_address && !result.fully_qualified_name) {
        throw new Error('Provisioning response did not contain an identity or fully qualified name.');
      }
  
      if (result.identity_address && result.identity_address !== requestedId) { 
        throw new Error(`Provisioning response identity [${result.identity_address}]
          address does not match requested identity address[${requestedId}].`);
      }
  
      if (result.fully_qualified_name && result.fully_qualified_name.toLowerCase() !== requestedFqn.toLowerCase()) {
        throw new Error(`Provisioning response fully qualified name [${result.fully_qualified_name.toLowerCase()}]
          does not match requested fully qualified name[${requestedFqn.toLowerCase()}].`);
      }
    }
  };

  const cancel = () => {
    dispatch(setNavigationPath(PROVISIONING_FORM));
  };

  const submitData = async () => {
    setLoading(true);

    const submissionSuccess = (response, requestedFqn, provisioningName, requestedId) => {
      setLoading(false);
      dispatch(setProvisioningResponse(response));
      dispatch(setRequestedFqn(requestedFqn));
      dispatch(setProvisioningName(provisioningName));
      dispatch(setRequestedId(requestedId));
      dispatch(setNavigationPath(PROVISIONING_RESULT));
    };

    const submissionError = (msg) => {
      setSubmissionError({
        showError: true,
        description: msg,
      });
      setLoading(false);
    };

    try {
      const loginRequest = new LoginConsentRequest(request);

      const webhookSubject = loginRequest.challenge.provisioning_info ? loginRequest.challenge.provisioning_info.find(x => {
        return x.vdxfkey === LOGIN_CONSENT_ID_PROVISIONING_WEBHOOK_VDXF_KEY.vdxfid;
      }) : null;

      if (webhookSubject == null) throw new Error('No endpoint for ID provisioning');

      const webhookUrl = webhookSubject.data;

      const identity =
        identityToProvisionField != null
          ? identityToProvisionField.trim()
          : '';
      
      let identityName;
      let isIAddress;
      let parent;
      let systemid;
      let nameId;
      let requestedFqn;

      try {
        fromBase58Check(identity);
        isIAddress = true;
      } catch {
        isIAddress = false;
      }

      if (isIAddress) {
        const identityObj = await getIdentity(request.chainTicker, identity);
  
        identityName = identityObj.identity.name;
        parent = identityObj.identity.parent;
        systemid = identityObj.identity.systemid;
        nameId = identity;
        requestedFqn = identityObj.fullyqualifiedname;
        
      } else {
        identityName = identity.split('@')[0];
        parent = provParent ? provParent.data : null;
        systemid = provSystemId ? provSystemId.data : null;
        const parentObj = await getIdentity(request.chainTicker, parent ? parent : loginRequest.system_id);

        requestedFqn = `${identityName.split('.')[0]}.${parentObj.fullyqualifiedname}`;
        nameId = (await getVdxfId(request.chainTicker, requestedFqn)).vdxfid;
      }

      const provisionRequest = new LoginConsentProvisioningRequest({
        signing_address: primaryAddress,
        
        challenge: new LoginConsentProvisioningChallenge({
          challenge_id: loginRequest.challenge.challenge_id,
          created_at: Number((Date.now() / 1000).toFixed(0)),
          name: identityName,
          system_id: systemid,
          parent: parent
        }),
      });
      
      const signedRequest = await signIdProvisioningRequest(request.chainTicker, provisionRequest, primaryAddress);
      
      // The responding server should include the error within the response instead of 
      // using an error code.
      const res = await axios.post(
        webhookUrl,
        signedRequest
      );

      const provisionResponse = res.data;
      await handleProvisioningResponse(provisionResponse, nameId, requestedFqn);

      const provisioningName = (await getIdentity(request.chainTicker, loginRequest.signing_id)).identity.name;
      
      submissionSuccess(res.data, requestedFqn, provisioningName, nameId);
    } catch (e) {
      submissionError(e.message);
    }
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
              flexDirection: 'row',
              padding: 8,
            }}
          >
            {`Review the Provisioning Request`}
          </div>
        </div>
        <Box sx={{
          flex: 1,
          width: '100%',
        }}>
          <Card square sx={{
            marginTop: 1,
            marginBottom: 1,
            width: '100%',
            overflowY: 'scroll',
            maxHeight: '54vh',
          }}> 
            <List>
              <ListItem>
                <ListItemText primary='Identity' disableTypography sx={{ fontWeight: 'bold' , pr:4}}/>
                <ListItemText primary={displayIdentity} disableTypography sx={{textAlign:'right'}}/>
              </ListItem>
              {provAddress &&
                <Box>
                  <Divider/>
                  <ListItem>
                    <ListItemText primary='Identity address' disableTypography sx={{ fontWeight: 'bold' , pr:4}}/>
                    <ListItemText primary={provAddress.data} disableTypography sx={{textAlign:'right'}}/>
                  </ListItem>
                </Box>
              }
              <Divider/>
              <ListItem>
                <ListItemText primary='Primary address (once received)' disableTypography sx={{ fontWeight: 'bold' , pr:4}}/>
                <ListItemText primary={primaryAddress} disableTypography sx={{textAlign:'right'}}/>
              </ListItem>
              {displayParent &&
                <Box>
                  <Divider/>
                  <ListItem>
                    <ListItemText primary='Identity parent' disableTypography sx={{ fontWeight: 'bold' , pr:4}}/>
                    <ListItemText primary={displayParent} disableTypography sx={{textAlign:'right'}}/>
                  </ListItem>
                </Box>
              }
              {provFqn &&
                <Box>
                  <Divider/>
                  <ListItem>
                    <ListItemText primary='Full identity name' disableTypography sx={{ fontWeight: 'bold' , pr:4}}/>
                    <ListItemText primary={provFqn.data} disableTypography sx={{textAlign:'right'}}/>
                  </ListItem>
                </Box>
              }
              {displaySystemid &&
                <Box>
                  <Divider/>
                  <ListItem>
                    <ListItemText primary='Identity system ID' disableTypography sx={{ fontWeight: 'bold' , pr:4}}/>
                    <ListItemText primary={displaySystemid} disableTypography sx={{textAlign:'right'}}/>
                  </ListItem>
                </Box>
              }
            </List>
          </Card>
        </Box>
        <SnackbarAlert
          open={submissionError.showError}
          text={submissionError.description}
          handleClose={() => {setSubmissionError(false, '');}}
        ></SnackbarAlert>
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
            <Button
              variant='text'
              disabled={loading}
              color='secondary'
              onClick={() => cancel()}
              style={{
                width: 120,
                marginRight: 32,
                padding: 8,
              }}
            >
              {'Back'}
            </Button>
            <Button
              variant='contained'
              color='success'
              disabled={loading}
              onClick={() => submitData()}
              style={{
                width: 120,
                padding: 8,
              }}
            >
              {'Request'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProvisionIdentityConfirm;