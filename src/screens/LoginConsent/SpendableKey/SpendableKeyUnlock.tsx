import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {GenericRequest} from 'verus-typescript-primitives';

import CollapsibleListSection from '#/components/CollapsibleListSection';
import NestedListItem from '#/components/NestedListItem';
import PageLayout from '#/components/PageLayout';
import {extractSpendableKeyData} from '#/features/login/spendableKeyDataExtractors';
import {useAppDispatch} from '#/redux/hooks';
import {setError} from '#/redux/reducers/error/error.actions';
import {RootState} from '#/redux/store';
import {
  claimSpendableKey,
  SpendableKeyClaimResult,
  SpendableKeyClaimResults,
} from '#/rpc/calls/claimSpendableKey';
import {
  discoverSpendableKeyClaims,
  SpendableKeyClaims,
} from '#/rpc/calls/discoverSpendableKeyClaims';
import {getAddresses} from '#/rpc/calls/getAddresses';
import {unlockSpendableKey} from '#/rpc/calls/unlockSpendableKey';
import {convertFqnToDisplayFormat} from '#/utils/fullyqualifiedname';

interface SpendableKeyUnlockProps {
  completeLoginConsent: () => Promise<void>;
}

const getClaimTitle = ({currencies, identities}: SpendableKeyClaims): string => {
  if (currencies.length > 0 && identities.length > 0) return 'Claim identity and funds';
  if (identities.length > 0) return 'Claim identity';
  return 'Claim funds';
};

const getTransactionLabel = (result: SpendableKeyClaimResult, ticker: string): string => {
  if (result.type === 'identity' && result.includesSweep)
    return `${ticker} identity and funds claim`;
  if (result.type === 'identity') return `${ticker} identity claim txID`;
  return `${ticker} funds claim`;
};

const SpendableKeyUnlock: React.FC<SpendableKeyUnlockProps> = props => {
  const {completeLoginConsent} = props;
  const dispatch = useAppDispatch();
  const deeplinkData = useSelector((state: RootState) => state.deeplink.data) as GenericRequest;
  const currentDetailIndex = useSelector((state: RootState) => state.navigation.currentDetailIndex);
  const chainId = useSelector((state: RootState) => state.chainMetadata.chainId);
  const chainName = useSelector((state: RootState) => state.chainMetadata.chainName);

  const {requiresPassword} = extractSpendableKeyData(deeplinkData, currentDetailIndex);

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [claims, setClaims] = useState<SpendableKeyClaims | null>(null);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [privateAddresses, setPrivateAddresses] = useState<string[]>([]);
  const [privateAddress, setPrivateAddress] = useState('');
  const [assignPrivateAddress, setAssignPrivateAddress] = useState(true);
  const [claimError, setClaimError] = useState('');
  const [claimResult, setClaimResult] = useState<SpendableKeyClaimResults | null>(null);

  const unlock = async (): Promise<void> => {
    setLoading(true);
    setPasswordError('');

    let address: string;

    try {
      ({address} = await unlockSpendableKey(chainId, deeplinkData, currentDetailIndex, password));
    } catch (e: unknown) {
      if (requiresPassword) {
        setPasswordError(e instanceof Error ? e.message : String(e));
      } else {
        dispatch(setError(e));
      }

      setLoading(false);
      return;
    }

    try {
      const found = await discoverSpendableKeyClaims(chainId, address);

      if (found.currencies.length > 0 || found.identities.length > 0) {
        // Same wallet addresses the provisioning form offers, plus sapling z-addresses for IDs.
        const walletAddresses = await getAddresses(chainId, true, false);
        const publicAddresses: string[] = walletAddresses.public
          .filter((addr: {tag: string}) => addr.tag === 'public')
          .map((addr: {address: string}) => addr.address);
        const saplingAddresses: string[] = walletAddresses.private
          .filter((addr: {tag: string}) => addr.tag === 'sapling')
          .map((addr: {address: string}) => addr.address);

        setAddresses(publicAddresses);
        setDestinationAddress(publicAddresses[0] ?? '');
        setPrivateAddresses(saplingAddresses);
        setPrivateAddress(saplingAddresses[0] ?? '');
      }

      setClaims(found);
    } catch (e: unknown) {
      dispatch(setError(e));
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!requiresPassword) unlock();
  }, []);

  const claim = async (): Promise<void> => {
    setLoading(true);
    setClaimError('');

    // Like Mobile: IDs get the wallet z-address when chosen, and lose theirs if the wallet has none.
    let claimPrivateAddress: string | null | undefined;

    if (claims.identities.length > 0) {
      if (privateAddresses.length === 0) claimPrivateAddress = null;
      else if (assignPrivateAddress) claimPrivateAddress = privateAddress;
    }

    try {
      setClaimResult(
        await claimSpendableKey(
          chainId,
          deeplinkData,
          currentDetailIndex,
          password,
          destinationAddress,
          claimPrivateAddress
        )
      );
    } catch (e: unknown) {
      setClaimError(e instanceof Error ? e.message : String(e));
    }

    setLoading(false);
  };

  const close = async (): Promise<void> => {
    setLoading(true);
    await completeLoginConsent();
  };

  const locked = claims == null;
  const hasClaims = !locked && (claims.currencies.length > 0 || claims.identities.length > 0);
  const hasIdentities = !locked && claims.identities.length > 0;
  const hasUnsupportedIdentities =
    hasIdentities && claims.identities.some(identity => identity.unsupportedReason != null);
  const claimed = claimResult != null;
  const submittedCount = claimed ? claimResult.results.length : 0;

  let title = 'Scanning spendable key';
  if (!locked) title = getClaimTitle(claims);
  else if (requiresPassword) title = 'Decrypt spendable key';

  let subtitle = 'No transparent funds or VerusIDs were found.';
  if (claimed && claimResult.partialError) {
    subtitle = 'Some claim transactions were submitted before an error.';
  } else if (claimed) {
    subtitle = 'The claim transactions were submitted.';
  } else if (hasClaims) {
    subtitle = 'Review the transparent funds and VerusIDs found on this key.';
  }

  return (
    <PageLayout
      title={title}
      loading={loading}
      contentStyle={{
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 0.5,
      }}
      footerContent={
        <>
          {!claimed && (
            <Button
              variant="text"
              disabled={loading}
              color="secondary"
              onClick={close}
              sx={{width: 120, mr: 4, p: 1}}
            >
              {locked || hasClaims ? 'Cancel' : 'Done'}
            </Button>
          )}
          {locked && requiresPassword && (
            <Button
              variant="contained"
              color="primary"
              disabled={loading || password === ''}
              onClick={unlock}
              sx={{width: 120, p: 1}}
            >
              Decrypt
            </Button>
          )}
          {hasClaims && !claimed && (
            <Button
              variant="contained"
              color="primary"
              disabled={loading || hasUnsupportedIdentities || destinationAddress === ''}
              onClick={claim}
              sx={{width: 120, p: 1}}
            >
              Claim
            </Button>
          )}
          {claimed && (
            <Button
              variant="contained"
              color="primary"
              disabled={loading}
              onClick={close}
              sx={{width: 120, p: 1}}
            >
              Done
            </Button>
          )}
        </>
      }
    >
      <Box
        sx={{maxWidth: 560, width: '100%', display: 'flex', flexDirection: 'column', minHeight: 0}}
      >
        {locked && requiresPassword && (
          <>
            <Typography sx={{mb: 2}}>
              This spendable key is encrypted and needs to be decrypted before you can redeem its
              funds or VerusIDs.
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              type="password"
              label="Claim password"
              value={password}
              error={passwordError !== ''}
              helperText={passwordError}
              disabled={loading}
              onChange={event => setPassword(event.target.value)}
            />
          </>
        )}
        {!locked && (
          <Typography color="text.secondary" sx={{mb: 2, textAlign: 'center'}}>
            {subtitle}
          </Typography>
        )}
        {claimed && claimResult.partialError && (
          <Typography color="error" variant="body2" sx={{mb: 2}}>
            {`An error occurred after the transaction${submittedCount === 1 ? '' : 's'} below: ${claimResult.partialError}`}
          </Typography>
        )}
        {claimed && claimResult.results.some(result => result.type === 'identity') && (
          <Typography color="text.secondary" variant="body2" sx={{mb: 2}}>
            The claimed VerusID may now appear linked to your wallet, but the claim transaction
            still requires blockchain confirmation before the VerusID is considered yours. Wait for
            the claim transaction with the shown txID to be confirmed before sending funds to the
            VerusID.
          </Typography>
        )}
        {(hasClaims || claimed) && (
          <Card
            square
            sx={{
              width: '100%',
              maxHeight: '100%',
              minHeight: 0,
              overflowY: 'auto',
              scrollbarGutter: 'stable',
            }}
          >
            {!claimed && (
              <Box sx={{p: 2, pb: 0}}>
                {hasUnsupportedIdentities && (
                  <Typography color="warning.main" variant="body2" sx={{mb: 2}}>
                    One or more VerusIDs cannot be claimed. No transactions will be sent until all
                    discovered items can be claimed.
                  </Typography>
                )}
                <FormControl fullWidth size="small">
                  <InputLabel id="claim-address-label">Claim to</InputLabel>
                  <Select
                    labelId="claim-address-label"
                    label="Claim to"
                    value={destinationAddress}
                    disabled={loading}
                    sx={{textAlign: 'start'}}
                    onChange={e => setDestinationAddress(e.target.value)}
                  >
                    {addresses.map(address => (
                      <MenuItem key={address} value={address}>
                        {address}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {hasIdentities && privateAddresses.length > 0 && (
                  <>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={assignPrivateAddress}
                          disabled={loading}
                          onChange={e => setAssignPrivateAddress(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Assign identity z-address to wallet z-address"
                      sx={{mt: 1}}
                    />
                    {assignPrivateAddress && (
                      <FormControl fullWidth size="small" sx={{mt: 1}}>
                        <InputLabel id="claim-private-address-label">Wallet z-address</InputLabel>
                        <Select
                          labelId="claim-private-address-label"
                          label="Wallet z-address"
                          value={privateAddress}
                          disabled={loading}
                          sx={{textAlign: 'start'}}
                          onChange={e => setPrivateAddress(e.target.value)}
                        >
                          {privateAddresses.map(address => (
                            <MenuItem key={address} value={address}>
                              {address}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </>
                )}
                {hasIdentities && privateAddresses.length === 0 && (
                  <Typography color="warning.main" variant="body2" sx={{mt: 2}}>
                    Your wallet has no z-address for 1 identity chain. Existing z-addresses will be
                    removed from those claimed VerusIDs.
                  </Typography>
                )}
                {claimError !== '' && (
                  <Typography color="error" variant="body2" sx={{mt: 2}}>
                    {claimError}
                  </Typography>
                )}
              </Box>
            )}
            <List disablePadding sx={{'& > *:last-child': {borderBottom: 'none'}}}>
              {claimed && (
                <CollapsibleListSection
                  title="Submitted transactions"
                  subtitle={`${submittedCount} transaction${submittedCount === 1 ? '' : 's'} submitted.`}
                  initiallyExpanded
                >
                  {claimResult.results.map(result => (
                    <NestedListItem
                      key={result.txid}
                      primary={getTransactionLabel(result, chainName)}
                      secondary={<span style={{wordBreak: 'break-all'}}>{result.txid}</span>}
                      variant="standard"
                    />
                  ))}
                </CollapsibleListSection>
              )}
              {!claimed && claims.currencies.length > 0 && (
                <CollapsibleListSection title="Balances" subtitle={chainName} initiallyExpanded>
                  {claims.currencies.map(currency => (
                    <NestedListItem
                      key={currency.currencyId}
                      primary={currency.name}
                      secondary={currency.amount}
                      variant="standard"
                    />
                  ))}
                </CollapsibleListSection>
              )}
              {!claimed && claims.identities.length > 0 && (
                <CollapsibleListSection title="VerusIDs" subtitle={chainName} initiallyExpanded>
                  {claims.identities.map(identity => (
                    <NestedListItem
                      key={identity.identityAddress}
                      primary={identity.unsupportedReason ?? identity.identityAddress}
                      secondary={
                        identity.fullyQualifiedName
                          ? convertFqnToDisplayFormat(identity.fullyQualifiedName)
                          : identity.identityAddress
                      }
                      variant="standard"
                    />
                  ))}
                </CollapsibleListSection>
              )}
            </List>
          </Card>
        )}
      </Box>
    </PageLayout>
  );
};

export default SpendableKeyUnlock;