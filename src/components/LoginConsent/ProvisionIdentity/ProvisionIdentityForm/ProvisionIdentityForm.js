import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PROVISIONING_CONFIRM, SELECT_LOGIN_ID } from '../../../../utils/constants';
import { setNavigationPath } from '../../../../redux/reducers/navigation/navigation.actions';
import { 
  ID_ADDRESS_VDXF_KEY,
  ID_SYSTEMID_VDXF_KEY,
  ID_FULLYQUALIFIEDNAME_VDXF_KEY,
  ID_PARENT_VDXF_KEY,
  LOGIN_CONSENT_ID_PROVISIONING_WEBHOOK_VDXF_KEY,
  fromBase58Check,
} from 'verus-typescript-primitives';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { VerusIdLogo } from "../../../../images";
import { getIdentity } from '../../../../rpc/calls/getIdentity';
import { InputAdornment } from '@mui/material';
import { setIdentityToProvisionField, setProvisioningInfo } from '../../../../redux/reducers/provision/provision.actions';
import { getAddresses } from '../../../../rpc/calls/getAddresses';

const ProvisionIdentityForm = (props) => {
  const dispatch = useDispatch();
  const { request } = useSelector((state) => state.rpc.loginConsentRequest);
  const identityToProvisionField = useSelector((state) => state.provision.identityToProvisionField);

  const hasProvisioningInfo = request != null && request.challenge.provisioning_info != null;

  const [state, setState] = useState({
    friendlyNameMap: {},
    provisioningInfo: hasProvisioningInfo
      ? request.challenge.provisioning_info
      : [],
    provAddress: null,
    provSystemId: null,
    provFqn: null,
    provParent: null,
    provWebhook: null,
    assignedIdentity: null,
    loading: false,
    parentname: '',
    addresses: {},
  });

  const [formError, setFormError] =  useState({
    error: false,
    description: '' 
  });

  useEffect(() => {

    // Extract the provisioning info from the request.
    const updateProvisioningInfoProcessedData = async () => {
      if (!hasProvisioningInfo) return;
  
      const findProvisioningInfo = (key) =>
        request.challenge.provisioning_info.find(
          (x) => x.vdxfkey === key.vdxfid
        );
  
      const provAddress = findProvisioningInfo(ID_ADDRESS_VDXF_KEY);
      const provSystemId = findProvisioningInfo(ID_SYSTEMID_VDXF_KEY);
      const provFqn = findProvisioningInfo(ID_FULLYQUALIFIEDNAME_VDXF_KEY);
      const provParent = findProvisioningInfo(ID_PARENT_VDXF_KEY);
      const provWebhook = findProvisioningInfo(LOGIN_CONSENT_ID_PROVISIONING_WEBHOOK_VDXF_KEY);
  
      setState((currentState) => ({
        ...currentState,
        provAddress,
        provSystemId,
        provFqn,
        provParent,
        provWebhook,
      }));
    };

    const initializeState = async () => {
      await updateProvisioningInfoProcessedData();

      // Get the addresses of the wallet so the identity can be provisioned to one of them.
      const addresses = await getAddresses(request.chainTicker, true, false);
      setState((currentState) => ({
        ...currentState,
        addresses
      }));
    
      setState((currentState) => {
        const provIdKey = currentState.provAddress || currentState.provFqn || null;
    
        const identitykeys = provIdKey == null ? [] : [provIdKey];
        if (currentState.provParent) identitykeys.push(currentState.provParent);
        if (currentState.provSystemId) identitykeys.push(currentState.provSystemId);
    
        const fetchIdentities = async () => {
          let friendlyNameMap = currentState.friendlyNameMap;
          let assignedIdentity = null;
          let parentname = '';

          for (const idKey of identitykeys) {
            if (idKey != null) {
              const identity = await getIdentity(request.chainTicker, idKey.data);
    
              if (identity) {
                friendlyNameMap[identity.identity.identityaddress] =
                  identity.identity.name;
    
                if (provIdKey != null && idKey.data === provIdKey.data) {
                  assignedIdentity = identity.identity.identityaddress;
                  dispatch(setIdentityToProvisionField(identity.identity.name));
                }
                if (idKey.vdxfkey === ID_PARENT_VDXF_KEY.vdxfid) {
                  parentname = `.${identity.fullyqualifiedname}`
                } 
              }
            }
          }
    
          return { friendlyNameMap, assignedIdentity, parentname };
        };
    
        fetchIdentities().then(({ parentname, friendlyNameMap, assignedIdentity }) => {
          setState({ ...currentState, friendlyNameMap, assignedIdentity, loading: false, parentname });
        });
    
        return { ...currentState, loading: true };
      });
    };
    
    initializeState();    
  }, []);

  const formHasError = () => {
    const identity = identityToProvisionField?.trim() || '';
  
    if (!identity) {
      setFormError({
        error: true,
        description: 'Identity is a required field.'
      });
      return true;
    }
  
    try {
      fromBase58Check(identity);
      if (state.parentname) {
        setFormError({
          error: true,
          description: 'i-Address cannot have a parent name.'
        });
        return true;
      }
    } catch (e) {
      const formattedId = state.parentname ? `${identity}${state.parentname}` : `${identity}@`;
      if (!formattedId.endsWith('@')) {
        setFormError({
          error: true,
          description: 'Identity not a valid identity handle or iAddress.'
        });
        return true;
      }
    }

    // Clear any old errors.
    setFormError({
      error: false,
      description: ''
    });
  
    return false;
  };

  const submitData = async () => {
    if (formHasError()) return;

    setState((currentState) => {return { ...currentState, loading: true}});
  
    const identity = identityToProvisionField;

    let formattedId;

    try {
      fromBase58Check(identity);
      formattedId = identity;
    } catch(e) {
      formattedId = state.parentname ? `${identity}${state.parentname}` : `${identity}.${request.chainName}@`;
    }

    let identityError = false;

    try {
      await getIdentity(request.chainTicker, formattedId);

      // If we get a result back, that means the identity must already exist.
      identityError = true;
      setFormError({
        error: true,
        description: 'Identity name taken, please select a different name.'
      });
  
    } catch (e) {
      // Check for an invalid identity, otherwise the identity is valid since it does not already exist
      // and it is using valid characters.
      if (e.message.includes("Identity parameter must be valid friendly name or identity address")) {
        identityError = true;
        setFormError({
          error: true,
          description: 'Identity name must not include / : * ? " < > | @ .'
        });
      }
    }
  
    setState((currentState) => {return { ...currentState, loading: false}});

    if (!identityError) {
      // Find a public address to provision the identity to.
      const publicAddresses = state.addresses.public.filter((address) => address.tag === "public");

      dispatch(setProvisioningInfo({
        primaryAddress: publicAddresses[0],
        provAddress: state.provAddress,
        provSystemId: state.provSystemId,
        provFqn: state.provFqn,
        provParent: state.provParent,
        provWebhook: state.provWebhook,
        friendlyNameMap: state.friendlyNameMap
      }));
      dispatch(setNavigationPath(PROVISIONING_CONFIRM));
    }
  }

  const cancel = () => {
    dispatch(setNavigationPath(SELECT_LOGIN_ID));
  }

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
            {`Request VerusID`}
          </div>
        </div>

        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            flex: 1,
            paddingTop: 2,
          }}
        >
          <TextField
            sx={{
              maxWidth: 560,
              width: "100%",
            }}
            variant="outlined"
            error={formError.error}
            helperText={formError.description}
            label={state.parentname ? "VerusID name" : "i-Address or VerusID name"}
            value={state.assignedIdentity
              ? state.friendlyNameMap[state.assignedIdentity]
                ? `${state.friendlyNameMap[state.assignedIdentity]}`
                : state.assignedIdentity
              : identityToProvisionField}
            mode="outlined"
            disabled={state.assignedIdentity != null || state.loading}
            onChange={event => {
              const text = event.target.value;
              if (state.assignedIdentity == null && !text.endsWith("@")) {
                dispatch(setIdentityToProvisionField(text));
              }
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">{state.parentname ? state.parentname : ``}</InputAdornment>,
            }}
          >
          </TextField>
        </div>

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

export default ProvisionIdentityForm;