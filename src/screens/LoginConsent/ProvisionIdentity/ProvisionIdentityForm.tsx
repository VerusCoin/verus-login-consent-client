import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import {
  fromBase58Check,
  GenericRequest,
  ID_PARENT_VDXF_KEY,
  LoginConsentRequest,
  ProvisionIdentityDetails,
} from 'verus-typescript-primitives';

import PageLayout from '#/components/PageLayout';
import {
  extractProvisionIdentityDataV1,
  extractProvisionIdentityDataV2,
  ProvisioningInfoItem,
} from '#/features/login/provisionIdentityDataExtractors';
import {useAppDispatch} from '#/redux/hooks';
import {
  navigateBackGenericRequest,
  navigateGenericRequest,
  setNavigationPath,
} from '#/redux/reducers/navigation/navigationSlice';
import {
  setIdentityToProvisionField,
  setPrimaryAddress,
  setProvisioningInfo,
} from '#/redux/reducers/provision/provisionSlice';
import {RootState} from '#/redux/store';
import {getAddresses} from '#/rpc/calls/getAddresses';
import {getIdentity} from '#/rpc/calls/getIdentity';
import {PROVISIONING_CONFIRM, SELECT_LOGIN_ID} from '#/utils/constants';

interface FormError {
  error: boolean;
  description: string;
}

type FriendlyNameMap = Record<string, string>;

const ProvisionIdentityForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const deeplinkData = useSelector((state: RootState) => state.deeplink.data);
  const chainId = useSelector((state: RootState) => state.chainMetadata.chainId);
  const chainName = useSelector((state: RootState) => state.chainMetadata.chainName);
  const identityToProvisionField = useSelector(
    (state: RootState) => state.provision.identityToProvisionField
  );
  const initialPrimaryAddress = useSelector((state: RootState) => state.provision.primaryAddress);
  const currentDetailIndex = useSelector((state: RootState) => state.navigation.currentDetailIndex);

  const isGenericRequest = deeplinkData instanceof GenericRequest;

  const loginRequest = deeplinkData as LoginConsentRequest;

  const hasProvisioningInfo = isGenericRequest
    ? deeplinkData.details[currentDetailIndex].data instanceof ProvisionIdentityDetails
    : loginRequest != null && loginRequest.challenge?.provisioning_info != null;

  const [friendlyNameMap, setFriendlyNameMap] = useState<FriendlyNameMap>({});
  const [provAddress, setProvAddress] = useState<ProvisioningInfoItem | null>(null);
  const [provSystemId, setProvSystemId] = useState<ProvisioningInfoItem | null>(null);
  const [provFqn, setProvFqn] = useState<ProvisioningInfoItem | null>(null);
  const [provParent, setProvParent] = useState<ProvisioningInfoItem | null>(null);
  const [provWebhook, setProvWebhook] = useState<ProvisioningInfoItem | null>(null);
  const [assignedIdentity, setAssignedIdentity] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [parentName, setParentName] = useState('');
  const [publicAddresses, setPublicAddresses] = useState<string[]>([]);
  const [selectedPublicAddress, setSelectedPublicAddress] = useState('');

  const [formError, setFormError] = useState<FormError>({
    error: false,
    description: '',
  });

  useEffect(() => {
    const initializeState = async () => {
      if (!hasProvisioningInfo) return;

      setLoading(true);

      const {address, systemId, fqn, parent, webhook} = isGenericRequest
        ? extractProvisionIdentityDataV2(deeplinkData, currentDetailIndex)
        : extractProvisionIdentityDataV1(deeplinkData as LoginConsentRequest);

      console.log('Found address: ', address);

      // Get the addresses of the wallet so the identity can be provisioned to one of them.
      const addresses = await getAddresses(chainId, true, false);
      const publicAddressObjects = addresses.public.filter(
        (addr: {tag: string}) => addr.tag === 'public'
      );
      // Extract just the r-address from the address object.
      const resolvedAddresses: string[] = publicAddressObjects.map(
        (addr: {address: string}) => addr.address
      );
      setPublicAddresses(resolvedAddresses);

      if (initialPrimaryAddress && resolvedAddresses.includes(initialPrimaryAddress)) {
        setSelectedPublicAddress(initialPrimaryAddress);
      }

      const provIdKey = address || fqn || null;
      const identityKeys: ProvisioningInfoItem[] = provIdKey ? [provIdKey] : [];
      if (parent) identityKeys.push(parent);
      if (systemId) identityKeys.push(systemId);

      const newFriendlyNameMap: FriendlyNameMap = {...friendlyNameMap};

      for (const idKey of identityKeys) {
        try {
          const identity = await getIdentity(chainId, idKey.data);

          if (identity) {
            // Get only the first part of the name to match the 'name' part of a getidentity call.
            let name = '';
            const firstDotIndex = identity.identity.name.indexOf('.');
            if (firstDotIndex === -1) name = identity.identity.name;
            else name = identity.identity.name.substring(0, firstDotIndex);

            newFriendlyNameMap[identity.identity.identityaddress] = name;

            if (provIdKey && idKey.data === provIdKey.data) {
              setAssignedIdentity(identity.identity.identityaddress);
              dispatch(setIdentityToProvisionField(name));
            }
            if (idKey.vdxfkey === ID_PARENT_VDXF_KEY.vdxfid) {
              setParentName(`.${identity.fullyqualifiedname}`);
            }
          }
        } catch {
          // If the given fully qualified name doesn't exist, then
          // it is not valid and should be ignored.
          if (fqn && idKey.data === fqn.data) {
            setProvFqn(null);
          }
        }
      }

      setFriendlyNameMap(newFriendlyNameMap);
      setProvAddress(address);
      setProvSystemId(systemId);
      setProvFqn(fqn);
      setProvParent(parent);
      setProvWebhook(webhook);
      setLoading(false);
    };

    initializeState();
  }, []);

  const formHasError = (): boolean => {
    const identity = identityToProvisionField ? identityToProvisionField.trim() : '';

    if (!identity) {
      setFormError({error: true, description: 'Identity is a required field.'});
      return true;
    }

    try {
      fromBase58Check(identity);
      if (parentName) {
        setFormError({error: true, description: 'i-Address cannot have a parent name.'});
        return true;
      }
    } catch {
      const formattedId = parentName ? `${identity}${parentName}` : `${identity}@`;
      if (!formattedId.endsWith('@')) {
        setFormError({
          error: true,
          description: 'Identity not a valid identity handle or iAddress.',
        });
        return true;
      }
    }

    setFormError({error: false, description: ''});
    return false;
  };

  const submitData = async (): Promise<void> => {
    if (formHasError()) return;

    setLoading(true);

    const identity = identityToProvisionField;

    let formattedId: string;
    try {
      fromBase58Check(identity);
      formattedId = identity;
    } catch {
      formattedId = parentName ? `${identity}${parentName}` : `${identity}.${chainName}@`;
    }

    let identityError = false;

    try {
      await getIdentity(chainId, formattedId);

      // If we get a result back, that means the identity must already exist.
      // That is expected if the identity is already assigned by the provisioning service.
      if (!assignedIdentity) {
        identityError = true;
        setFormError({
          error: true,
          description: 'Identity name taken, please select a different name.',
        });
      }
    } catch (e: unknown) {
      // Check for an invalid identity, otherwise the identity is valid since it does not already exist
      // and it is using valid characters.
      const message = e instanceof Error ? e.message : String(e);
      if (message.includes('Identity parameter must be valid friendly name or identity address')) {
        identityError = true;
        setFormError({
          error: true,
          description: `Identity name must not include / : * ? ' < > | @ .`,
        });
      }
    }

    setLoading(false);

    if (!identityError) {
      dispatch(setPrimaryAddress(selectedPublicAddress));
      dispatch(
        setProvisioningInfo({
          provAddress,
          provSystemId,
          provFqn,
          provParent,
          provWebhook,
          friendlyNameMap,
        })
      );
      if (isGenericRequest) {
        dispatch(navigateGenericRequest());
      } else {
        dispatch(setNavigationPath(PROVISIONING_CONFIRM));
      }
    }
  };

  const cancel = (): void => {
    if (isGenericRequest) {
      dispatch(navigateBackGenericRequest());
    } else {
      dispatch(setNavigationPath(SELECT_LOGIN_ID));
    }
  };

  const displayValue = assignedIdentity
    ? friendlyNameMap[assignedIdentity]
      ? `${friendlyNameMap[assignedIdentity]}`
      : assignedIdentity
    : identityToProvisionField;

  return (
    <PageLayout
      title="Request a VerusID"
      loading={loading}
      contentStyle={{
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 0.5,
      }}
      footerContent={
        <>
          <Button
            variant="text"
            disabled={loading}
            color="secondary"
            onClick={cancel}
            sx={{width: 120, mr: 4, p: 1}}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={loading || selectedPublicAddress === ''}
            onClick={submitData}
            sx={{width: 120, p: 1}}
          >
            Continue
          </Button>
        </>
      }
    >
      <Box sx={{maxWidth: 560, width: '100%'}}>
        <TextField
          fullWidth
          variant="outlined"
          error={formError.error}
          helperText={formError.description}
          label={parentName ? 'VerusID name' : 'i-Address or VerusID name'}
          value={displayValue}
          disabled={assignedIdentity != null || loading}
          onChange={event => {
            if (assignedIdentity == null) {
              dispatch(setIdentityToProvisionField(event.target.value));
            }
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">{parentName ? parentName : ''}</InputAdornment>
              ),
            },
          }}
        />
        <Box sx={{paddingTop: '10vh'}}>
          <FormControl fullWidth>
            <InputLabel id="address-select-label">Select a Primary Address</InputLabel>
            <Select
              labelId="address-select-label"
              label="Select a Primary Address"
              value={selectedPublicAddress}
              sx={{textAlign: 'start', pt: 0.25}}
              onChange={e => setSelectedPublicAddress(e.target.value)}
            >
              {publicAddresses.map(address => (
                <MenuItem key={address} value={address}>
                  {address}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default ProvisionIdentityForm;
