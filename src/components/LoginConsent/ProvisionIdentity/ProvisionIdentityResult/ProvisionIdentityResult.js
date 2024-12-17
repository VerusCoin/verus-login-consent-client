import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SELECT_LOGIN_ID } from '../../../../utils/constants';
import { setNavigationPath } from '../../../../redux/reducers/navigation/navigation.actions';
import Button from '@mui/material/Button';
import { VerusIdLogo } from "../../../../images";
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { setIdentities } from '../../../../redux/reducers/identity/identity.actions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { loadIdentities } from '../../../../rpc/calls/identities';

const ProvisionIdentityResult = () => {
  const dispatch = useDispatch();

  const { request } = useSelector((state) => state.rpc.loginConsentRequest);
  const provisioningResponse = useSelector((state) => state.provision.provisioningResponse);
  const requestedFqn = useSelector((state) => state.provision.requestedFqn);
  const provisioningName = useSelector((state) => state.provision.provisioningName);
  const provisioningInfo = useSelector((state) => state.provision.provisioningInfo);
  const {
    provParent,
  } = provisioningInfo;
  let intervalId = useRef(null);

  let formattedName = '';
  const lastDotIndex = requestedFqn.lastIndexOf('.');
  if (lastDotIndex === -1) formattedName = requestedFqn; // return the original string if there's no dot
  else formattedName = requestedFqn.substring(0, lastDotIndex);

  // Get the name that should appear in the identities list if the provisioning was successful.
  const names = requestedFqn.split('.');
  const isMainChain = 
    provisioningResponse.system_id === 'i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV' ||
    provisioningResponse.system_id === 'iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq';

  let expectedName;
  // The name will consist of the base name plus the parent except 
  // for when the parent is VRSC or VRSCTEST.
  if (names.length === 1 || (!provParent && isMainChain)) {
    expectedName = names[0];
  } else {
    expectedName = names[0] + '.' + names[1];
  }

  const [checkForId, setCheckForId] = useState(true);

  useEffect(() => {
    const checkForNewId = async () => {
      try {
        const identities = await loadIdentities(request.chainTicker);
        dispatch(setIdentities(identities));

        const found = identities.find(id => {
          return id.identity.name === expectedName;
        });

        if (found) {
          setCheckForId(false);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const startPolling = () => {
      intervalId.current = setInterval(async () => await checkForNewId(), 5000);
    };

    const stopPolling = () => {
      clearInterval(intervalId.current);
    };

    if (checkForId) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [checkForId]);
  

  const finishSend = () => {
    dispatch(setNavigationPath(SELECT_LOGIN_ID));
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
              flexDirection: "column",
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
          alignItems: "center",
        }}>
          {checkForId ? 
            <CircularProgress /> :
            <CheckCircleIcon color="success" sx={{ fontSize: 72 }} /> }
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
              variant="contained"
              color="primary"
              disabled={checkForId}
              onClick={() => finishSend()}
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
};

export default ProvisionIdentityResult;