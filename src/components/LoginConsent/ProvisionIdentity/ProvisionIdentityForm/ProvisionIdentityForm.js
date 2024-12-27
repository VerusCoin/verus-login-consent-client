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
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import { VerusIdLogo } from '../../../../images';
import { getIdentity } from '../../../../rpc/calls/getIdentity';
import { setIdentityToProvisionField, setPrimaryAddress, setProvisioningInfo } from '../../../../redux/reducers/provision/provision.actions';
import { getAddresses } from '../../../../rpc/calls/getAddresses';

const ProvisionIdentityForm = () => {
  const dispatch = useDispatch();
  const { request } = useSelector((state) => state.rpc.loginConsentRequest);
  const identityToProvisionField = useSelector((state) => state.provision.identityToProvisionField);
  const initialPrimaryAddress = useSelector((state) => state.provision.primaryAddress);

  const hasProvisioningInfo = request != null && request.challenge.provisioning_info != null;

  const [friendlyNameMap, setFriendlyNameMap] = useState({});

  const [provAddress, setProvAddress] = useState(null);
  const [provSystemId, setProvSystemId] = useState(null);
  const [provFqn, setProvFqn] = useState(null);
  const [provParent, setProvParent] = useState(null);
  const [provWebhook, setProvWebhook] = useState(null);
  const [assignedIdentity, setAssignedIdentity] = useState(null);

  const [loading, setLoading] = useState(false);
  const [parentName, setParentName] = useState('');
  const [publicAddresses, setPublicAddresses] = useState([]);
  const [selectedPublicAddress, setSelectedPublicAddress] = useState(initialPrimaryAddress);

  const [formError, setFormError] = useState({
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
  
      const address = findProvisioningInfo(ID_ADDRESS_VDXF_KEY);
      const systemId = findProvisioningInfo(ID_SYSTEMID_VDXF_KEY);
      const fqn = findProvisioningInfo(ID_FULLYQUALIFIEDNAME_VDXF_KEY);
      const parent = findProvisioningInfo(ID_PARENT_VDXF_KEY);
      const webhook = findProvisioningInfo(LOGIN_CONSENT_ID_PROVISIONING_WEBHOOK_VDXF_KEY);

      return {address, systemId, fqn, parent, webhook};
    };

    const initializeState = async () => {
      setLoading(true);

      const {address, systemId, fqn, parent, webhook} = await updateProvisioningInfoProcessedData();

      // Get the addresses of the wallet so the identity can be provisioned to one of them.
      const addresses = await getAddresses(request.chainTicker, true, false);
      const publicAddressObjects = addresses.public.filter((address) => address.tag === 'public');
      // Extract just the r-address from the address object.
      const publicAddresses = publicAddressObjects.map(addressObj => addressObj.address);
      setPublicAddresses(publicAddresses);
    
      const provIdKey = address || fqn || null;
  
      const identitykeys = provIdKey == null ? [] : [provIdKey];
      if (parent) identitykeys.push(parent);
      if (systemId) identitykeys.push(systemId);
  
      const fetchIdentities = async () => {
        let newFriendlyNameMap = friendlyNameMap;
        for (const idKey of identitykeys) {
          if (idKey != null) {
            try {
              const identity = await getIdentity(request.chainTicker, idKey.data);
  
              if (identity) {
                // Get only the first part of the name to match the 'name' part of a getidentity call.
                let name = '';
                const firstDoxIndex = identity.identity.name.indexOf('.');
                if (firstDoxIndex === -1) name = identity.identity.name;
                else name = identity.identity.name.substring(0, firstDoxIndex);

                newFriendlyNameMap[identity.identity.identityaddress] =
                  name;
    
                if (provIdKey != null && idKey.data === provIdKey.data) {
                  setAssignedIdentity(identity.identity.identityaddress);
                  dispatch(setIdentityToProvisionField(name));
                }
                if (idKey.vdxfkey === ID_PARENT_VDXF_KEY.vdxfid) {
                  const parentName = `.${identity.fullyqualifiedname}`;
                  setParentName(parentName);
                } 
              }
            } catch {
              // If the given fully qualified name doesn't exist, then
              // it is not valid and should be ignored.
              if (idKey.data === provFqn.data) {
                setProvFqn(null);
              }
            }
          }
        }

        setFriendlyNameMap(newFriendlyNameMap);
        setProvAddress(address);
        setProvSystemId(systemId);
        setProvFqn(fqn);
        setProvParent(parent);
        setProvWebhook(webhook);
      };

      fetchIdentities();
      setLoading(false);
    };
    
    initializeState();
  }, []);

  const formHasError = () => {
    const identity = identityToProvisionField ? identityToProvisionField.trim() : '';
  
    if (!identity) {
      setFormError({
        error: true,
        description: 'Identity is a required field.'
      });
      return true;
    }
  
    try {
      fromBase58Check(identity);
      if (parentName) {
        setFormError({
          error: true,
          description: 'i-Address cannot have a parent name.'
        });
        return true;
      }
    } catch {
      const formattedId = parentName ? `${identity}${parentName}` : `${identity}@`;
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

    setLoading(true);
  
    const identity = identityToProvisionField;

    let formattedId;

    try {
      fromBase58Check(identity);
      formattedId = identity;
    } catch {
      formattedId = parentName ? `${identity}${parentName}` : `${identity}.${request.chainName}@`;
    }

    let identityError = false;

    try {
      await getIdentity(request.chainTicker, formattedId);

      // If we get a result back, that means the identity must already exist.
      // That is expected if the identity is already assigned by the provisioning service.
      if (!assignedIdentity) {
        identityError = true;
        setFormError({
          error: true,
          description: 'Identity name taken, please select a different name.'
        });
      }
    } catch (e) {
      // Check for an invalid identity, otherwise the identity is valid since it does not already exist
      // and it is using valid characters.
      if (e.message.includes('Identity parameter must be valid friendly name or identity address')) {
        identityError = true;
        setFormError({
          error: true,
          description: `Identity name must not include / : * ? ' < > | @ .`
        });
      }
    }
  
    setLoading(false);

    if (!identityError) {
      dispatch(setPrimaryAddress(selectedPublicAddress));
      dispatch(setProvisioningInfo({
        provAddress: provAddress,
        provSystemId: provSystemId,
        provFqn: provFqn,
        provParent: provParent,
        provWebhook: provWebhook,
        friendlyNameMap: friendlyNameMap
      }));
      dispatch(setNavigationPath(PROVISIONING_CONFIRM));
    }
  };

  const cancel = () => {
    dispatch(setNavigationPath(SELECT_LOGIN_ID));
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
            {`Request a VerusID`}
          </div>
        </div>

        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flex: 1,
            paddingTop: 2,
          }}
        >
          {loading ?
            <Box sx={{ 
              display: 'flex',
              flex: 1,
              alignItems: 'center',
            }}>
              <CircularProgress />
            </Box>
            :
            <Box
              sx={{
                maxWidth: 560,
                width: '100%',
              }}>
              <TextField fullWidth
                variant='outlined'
                error={formError.error}
                helperText={formError.description}
                label={parentName ? 'VerusID name' : 'i-Address or VerusID name'}
                value={assignedIdentity
                  ? friendlyNameMap[assignedIdentity]
                    ? `${friendlyNameMap[assignedIdentity]}`
                    : assignedIdentity
                  : identityToProvisionField}
                mode='outlined'
                disabled={assignedIdentity != null || loading}
                onChange={event => {
                  const text = event.target.value;
                  if (assignedIdentity == null) {
                    dispatch(setIdentityToProvisionField(text));
                  }
                }}
                InputProps={{
                  endAdornment: 
                    <InputAdornment position='end'>
                      {parentName ? parentName : ``}
                    </InputAdornment>,
                }}
              >
              </TextField>
              <Box
                sx={{
                  paddingTop: '10vh'
                }}>
                <FormControl fullWidth>
                  <InputLabel id='address-select-label'>Select a Primary Address</InputLabel>
                  <Select
                    label='Select a Primary Address'
                    value={selectedPublicAddress}
                    displayEmpty
                    style={{
                      textAlign: 'start',
                      paddingTop: 2,
                    }}
                    onChange={(e) => {
                      return setSelectedPublicAddress(e.target.value);
                    }}
                  >
                    {publicAddresses.map(address => {
                      return (
                        <MenuItem
                          key={address}
                          value={address}
                        >{address}</MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          }
        </div>

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
              color='primary'
              disabled={loading || selectedPublicAddress === ''}
              onClick={() => submitData()}
              style={{
                width: 120,
                padding: 8,
              }}
            >
              {'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvisionIdentityForm;