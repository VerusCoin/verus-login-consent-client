import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PROVISIONING_FORM, PROVISIONING_RESULT } from '../../../../utils/constants';
import { setNavigationPath } from '../../../../redux/reducers/navigation/navigation.actions';
import Button from '@mui/material/Button';
import { VerusIdLogo } from "../../../../images";
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box'
import {
  LOGIN_CONSENT_CONTEXT_VDXF_KEY,
  LOGIN_CONSENT_ID_PROVISIONING_WEBHOOK_VDXF_KEY,
  LoginConsentProvisioningRequest,
  LoginConsentProvisioningChallenge,
  LoginConsentRequest
} from 'verus-typescript-primitives';
import { getIdentity } from '../../../../rpc/calls/getIdentity';

const ProvisionIdentityConfirm = (props) => {
  const dispatch = useDispatch();
  const { request } = useSelector((state) => state.rpc.loginConsentRequest);
  const provisioningInfo = useSelector((state) => state.provision.provisioningInfo);
  const identityToProvisionField = useSelector((state) => state.provision.identityToProvisionField);

  console.log(provisioningInfo);

  const {
    primaryAddress,
    provAddress,
    provSystemId,
    provFqn,
    provParent,
    provWebhook,
    friendlyNameMap,
  } = provisioningInfo;

  const displayIdentity = provFqn
    ? provFqn.data
    : friendlyNameMap[
      identityToProvisionField
      ]
    ? `${
        friendlyNameMap[
          identityToProvisionField
        ]
      }@`
    : identityToProvisionField;

  const displayParent = provParent != null && friendlyNameMap[provParent.data]
      ? friendlyNameMap[provParent.data]
      : null;
  
  const displaySystemid = provSystemId != null && friendlyNameMap[provSystemId.data]
    ? friendlyNameMap[provSystemId.data]
    : null;
  
  const [state, setState] = useState({
    loading: false,
  });

  const cancel = () => {
    dispatch(setNavigationPath(PROVISIONING_FORM));
  }

  const submitData = async () => {
    setState({ loading: false});

    const submissionSuccess = (response, requestedFqn) => {
      setState({ loading: false});
      /*
      this.props.navigation.navigate(SEND_MODAL_FORM_STEP_RESULT, {
        response: response,
        fullyQualifiedName: requestedFqn,
        success: true
      });
      */
    }

    const submissionError = (msg) => {
      console.error('Error', msg);

      setState({ loading: false});
    }

    try {
      const loginRequest = new LoginConsentRequest(request)

      const webhookSubject = loginRequest.challenge.provisioning_info ? loginRequest.challenge.provisioning_info.find(x => {
        return x.vdxfkey === LOGIN_CONSENT_ID_PROVISIONING_WEBHOOK_VDXF_KEY.vdxfid
      }) : null

      if (webhookSubject == null) throw new Error("No endpoint for ID provisioning")

      const webhookUrl = webhookSubject.data

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
      } catch (e) {
        isIAddress = false;
      }

      if (isIAddress) {
        const identityObj = await getIdentity(request.chainTicker, identity);
        
        // if (identityObj.error) throw new Error(identityObj.error.message)
  
        identityName = identityObj.identity.name;
        parent = identityObj.identity.parent;
        systemid = identityObj.identity.systemid;
        nameId = identity;
        requestedFqn = identityObj.fullyqualifiedname;
        
      } else {
        identityName = identity.split("@")[0];
        parent = provParent ? provParent.data : null;
        systemid = provSystemId ? provSystemId.data : null;
        const parentObj = await getIdentity(request.chainTicker, parent ? parent : loginRequest.system_id);

        requestedFqn = `${identityName.split(".")[0]}.${parentObj.fullyqualifiedname}`;
        // TODO: Implement getVdxfId
        nameId = (await getVdxfId(coinObj.system_id, requestedFqn)).result.vdxfid;
      }

      const provisionRequest = new LoginConsentProvisioningRequest({
        signing_address: primaryAddress,
        
        challenge: LoginConsentProvisioningChallenge({
          challenge_id: loginRequest.challenge.challenge_id,
          created_at: Number((Date.now() / 1000).toFixed(0)),
          name: identityName,
          system_id: systemid,
          parent: parent
        }),
      });

      const res = provisionRequest;
      console.log(res)
      
      /*
      const signedRequest = await signIdProvisioningRequest(coinObj, provisionRequest);

      const res = await axios.post(
        webhookUrl,
        signedRequest
      );

      const provisioningName = (await getIdentity(coinObj.system_id, loginRequest.signing_id)).result.identity.name;
      const newLoadingNotification = new LoadingNotification();

      await handleProvisioningResponse(coinObj, res.data, loginRequest.toBuffer().toString('base64'), 
        this.props.sendModal.data.fromService, provisioningName, newLoadingNotification.uid, nameId, requestedFqn, async () => {
          
          newLoadingNotification.body = "";
          let formattedName = ''
          const lastDotIndex = requestedFqn.lastIndexOf('.');
          if (lastDotIndex === -1) formattedName = requestedFqn; // return the original string if there's no dot
          else formattedName = requestedFqn.substring(0, lastDotIndex);

          newLoadingNotification.title =  [`${formattedName}@`, ` is being provisioned by `, `${provisioningName}@`]
          newLoadingNotification.acchash = this.props.activeAccount.accountHash;
          newLoadingNotification.icon = NOTIFICATION_ICON_VERUSID;

          dispatchAddNotification(newLoadingNotification);
        });
      */
      submissionSuccess(res.data, requestedFqn)
    } catch (e) {
      submissionError(e.message)
    }
  };
  

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: "100%",
      }}
    >
      <div
        style={{
          height: "100%",
          display: "flex",
          padding: 32,
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img src={VerusIdLogo} width={'55%'} height={'10%'}/>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              padding: 8,
            }}
          >
            {`Review Provisioning Request`}
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
                <ListItemText primary="Identity" disableTypography sx={{ fontWeight: 'bold' , pr:4}}/>
                <ListItemText primary={displayIdentity} disableTypography sx={{textAlign:'right'}}/>
              </ListItem>
              {provAddress &&
                <Box>
                  <Divider/>
                  <ListItem>
                    <ListItemText primary="Identity address" disableTypography sx={{ fontWeight: 'bold' , pr:4}}/>
                    <ListItemText primary={provAddress.data} disableTypography sx={{textAlign:'right'}}/>
                  </ListItem>
                </Box>
              }
              <Divider/>
              <ListItem>
                <ListItemText primary="Primary address (once received)" disableTypography sx={{ fontWeight: 'bold' , pr:4}}/>
                <ListItemText primary={primaryAddress.address} disableTypography sx={{textAlign:'right'}}/>
              </ListItem>
              {displayParent &&
                <Box>
                  <Divider/>
                  <ListItem>
                    <ListItemText primary="Identity parent" disableTypography sx={{ fontWeight: 'bold' , pr:4}}/>
                    <ListItemText primary={displayParent} disableTypography sx={{textAlign:'right'}}/>
                  </ListItem>
                </Box>
              }
              {provFqn &&
                <Box>
                  <Divider/>
                  <ListItem>
                    <ListItemText primary="Full identity name" disableTypography sx={{ fontWeight: 'bold' , pr:4}}/>
                    <ListItemText primary={provFqn} disableTypography sx={{textAlign:'right'}}/>
                  </ListItem>
                </Box>
              }
              {displaySystemid &&
                <Box>
                  <Divider/>
                  <ListItem>
                    <ListItemText primary="Identity system ID" disableTypography sx={{ fontWeight: 'bold' , pr:4}}/>
                    <ListItemText primary={displaySystemid} disableTypography sx={{textAlign:'right'}}/>
                  </ListItem>
                </Box>
              }
            </List>
          </Card>
        </Box>
        
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button
              variant="text"
              disabled={state.loading}
              color="secondary"
              onClick={() => cancel()}
              style={{
                width: 120,
                marginRight: 32,
                padding: 8,
              }}
            >
              {"Back"}
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={state.loading}
              onClick={() => submitData()}
              style={{
                width: 120,
                padding: 8,
              }}
            >
              {"Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProvisionIdentityConfirm;