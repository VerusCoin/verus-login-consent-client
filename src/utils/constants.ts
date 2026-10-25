import {IDENTITY_CREDENTIAL_PLAINLOGIN, IDENTITY_VIEW} from 'verus-typescript-primitives';

// App ID (fixed for reserve plugins)
export const VERUS_LOGIN_CONSENT_UI = 'VERUS_LOGIN_CONSENT_UI';

// General RPC API terms
export const NATIVE = 'native';
export const ELECTRUM = 'electrum';
export const ETH = 'eth';
export const ERC20 = 'erc20';
export const GET = 'get';
export const POST = 'post';
export const API_SUCCESS = 'success';
export const API_ERROR = 'error';

// RPC API Calls Used
export const API_AUTHENTICATE = 'auth';
export const API_FOCUS = 'plugin/focus';
export const API_CLOSE_PLUGIN = 'plugin/close';
export const API_ACTIVATE_COIN = 'coins/activate';
export const API_CHECK_ZCASH_PARAMS = 'zcashparamsexist';
export const API_DL_ZCASH_PARAMS = 'zcparamsdl';
export const API_GET_ADDRESSES = 'get_addresses';
export const API_GET_BLOCK = 'get_block';
export const API_GET_CREDENTIALS_BY_SCOPE = 'get_credentials_by_scope';
export const API_GET_CURRENCY = 'get_currency';
export const API_GET_IDENTITIES = 'get_identities';
export const API_GET_IDENTITY = 'get_identity';
export const API_GET_IDENTITY_CONTENT = 'get_identity_content';
export const API_GET_SIGNATURE_INFO = 'get_signature_info';
export const API_GET_VDXF_ID = 'get_vdxf_id';
export const API_GET_CHAIN_INFO = 'get_info';
export const API_SAVE_USERS = 'users/save';
export const API_ENCRYPT_KEY = 'encryptkey';
export const API_DECRYPT_KEY = 'decryptkey';
export const API_CHECK_AUTH = 'check_auth';
export const API_GET_CURRENT_USER = 'users/current';
export const API_GET_PLUGIN = 'plugin/get';
export const API_Z_GET_ENCRYPTION_ADDRESS = 'z_get_encryption_address';
export const API_SIGN_DATA = 'sign_data';

export const API_EXECUTE_IDENTITY_UPDATE_REQUEST =
  'verusid/identity/execute_identity_update_request';
export const API_EXECUTE_APP_ENCRYPTION_REQUEST = 'verusid/generic/execute_app_encryption_request';
export const API_ENCRYPT_APP_ENCRYPTION_RESPONSE =
  'verusid/generic/encrypt_app_encryption_response';
export const API_SIGN_ID_PROVISIONING_REQUEST = 'verusid/provision/sign_id_provisioning_request';
export const API_SIGN_IDENTITY_UPDATE_RESPONSE = 'verusid/identity/sign_identity_update_response';
export const API_SIGN_LOGIN_RESPONSE = 'verusid/login/sign_response';
export const API_VERIFY_GENERIC_REQUEST = 'verusid/generic/verify_generic_request';
export const API_SIGN_GENERIC_RESPONSE = 'verusid/generic/sign_generic_response';
export const API_UNLOCK_SPENDABLE_KEY = 'verusid/generic/unlock_spendable_key';
export const API_DISCOVER_SPENDABLE_KEY_CLAIMS = 'verusid/generic/discover_spendable_key_claims';
export const API_CLAIM_SPENDABLE_KEY = 'verusid/generic/claim_spendable_key';
export const API_VERIFY_ID_PROVISIONING_RESPONSE =
  'verusid/provision/verify_id_provisioning_response';
export const API_VERIFY_IDENTITY_UPDATE_REQUEST = 'verusid/identity/verify_identity_update_request';
export const API_VERIFY_LOGIN_REQUEST = 'verusid/login/verify_request';

export const AUTHORIZE_COIN = 'AUTHORIZE_COIN';
export const ADD_COIN = 'ADD_COIN';
export const SETUP = 'SETUP';
export const LOGIN = 'LOGIN';
export const SIGN_UP = 'SIGN_UP';
export const CONFIGURE = 'CONFIGURE';
export const CONFIGURE_LITE = 'CONFIGURE_LITE';
export const CONFIGURE_NATIVE = 'CONFIGURE_NATIVE';
export const CHAIN_FALLBACK_IMAGE = 'CHAIN_FALLBACK_IMAGE';

export const LITE = 'lite';
export const NATIVE_MINE = 'NATIVE_MINE';
export const NATIVE_RESCAN = 'NATIVE_RESCAN';
export const NATIVE_STAKE = 'NATIVE_STAKE';
export const NATIVE_MINE_THREADS = 'NATIVE_MINE_THREADS';
export const NATIVE_REINDEX = 'NATIVE_REINDEX';
export const ELECTRUM_NSPV = 'ELECTRUM_NSPV';
export const EXTERNAL_ACTION = 'EXTERNAL_ACTION';
export const SELECT_LOGIN_ID = 'SELECT_LOGIN_ID';
export const CONSENT_TO_SCOPE = 'CONSENT_TO_SCOPE';
export const IDENTITY_UPDATE_CORE = 'IDENTITY_UPDATE_CORE';
export const IDENTITY_UPDATE_CONTENTMULTIMAP = 'IDENTITY_UPDATE_CONTENTMULTIMAP';
export const LOADING_DISPLAY = 'LOADING_DISPLAY';
export const REDIRECT = 'REDIRECT';
export const PROVISIONING_FORM = 'PROVISIONING_FORM';
export const PROVISIONING_CONFIRM = 'PROVISIONING_CONFIRM';
export const PROVISIONING_RESULT = 'PROVISIONING_RESULT';
export const CREDENTIALS_REVIEW = 'CREDENTIALS_REVIEW';
export const DATA_PACKET_REVIEW = 'DATA_PACKET_REVIEW';
export const SPENDABLE_KEY_UNLOCK = 'SPENDABLE_KEY_UNLOCK';

export const ZC_PARAMS = {
  DOWNLOADING_ZCASH_KEYS: 'Downloading Zcash keys',
  BOTH_KEYS_VERIFIED: 'All Zcash param keys are downloaded and verified!',
  CLOSE_THE_MODAL: 'Close the modal and try to add a coin again.',
  ZCPARAMS_VERIFICATION_ERROR_P1: 'Zcash param',
  ZCPARAMS_VERIFICATION_ERROR_P2: 'verification error!',
  ZCPARAMS_FETCH: 'ZCash Params Fetch',
  SELECT_ZCPARAMS_SOURCE: 'Select resource to download Zcash params keys from',
  DOWNLOAD: 'Download',
  ZCASH_PARAMS_MISSING: 'Zcash params are missing or incomplete:',
  ZCASH_PARAMS_MISSING_ROOT_DIR: '- missing root folder',
  ZCASH_PARAMS_MISSING_PROVING_KEY: '- missing proving key',
  ZCASH_PARAMS_MISSING_VERIFYING_KEY: '- missing verifying key',
  ZCASH_PARAMS_MISSING_PROVING_KEY_SIZE: '- proving key size is incorrect',
  ZCASH_PARAMS_MISSING_VERIFYING_KEY_SIZE: '- verifying key size is incorrect',
  ZCASH_PARAMS_MISSING_SPEND_PARAMS: '- missing spend params',
  ZCASH_PARAMS_MISSING_OUTPUT_PARAMS: '- missing output params',
  ZCASH_PARAMS_MISSING_GROTH16_PARAMS: '- missing groth16 params',
  ZCASH_PARAMS_MISSING_SPEND_PARAMS_SIZE: '- spend params size is incorrect',
  ZCASH_PARAMS_MISSING_OUTPUT_PARAMS_SIZE: '- output params size is incorrect',
  ZCASH_PARAMS_MISSING_GROTH16_PARAMS_SIZE: '- groth16 params size is incorrect',
};
export const ZCPARAMS_SOCKET = 'zcparams';
export const ADDCOIN_DELAY = 500;

// ipc
export const IPC_ORIGIN_DEV = 'http://127.0.0.1:3001';
export const IPC_ORIGIN_DEV_LOCALHOST = 'http://localhost:3001';
export const IPC_ORIGIN_PRODUCTION = 'file://';
export const IPC_INIT_MESSAGE = 'init';
export const IPC_PUSH_MESSAGE = 'push';
export const IPC_LOGIN_CONSENT_REQUEST_METHOD = 'VERUS_LOGIN_CONSENT_REQUEST';

// External Actions Types
export const EXTERNAL_CHAIN_START = 'EXTERNAL_CHAIN_START';
export const EXTERNAL_ZCASHPARAMS = 'EXTERNAL_ZCASHPARAMS';

// Coin Option Constants
export const IS_ZCASH = 'is_zcash';
export const IS_PBAAS = 'is_pbaas';
export const IS_PBAAS_ROOT = 'is_pbaas_root';
export const IS_SAPLING = 'is_sapling';
export const Z_ONLY = 'z_only';
export const IS_VERUS = 'is_verus';
export const DEFAULT_DAEMON = 'verusd';
export const ZCASH_DAEMON = 'zcashd';
export const KOMODO_DAEMON = 'komodod';
export const ZCASH_CONF_NAME = 'zcash';
export const KOMODO_CONF_NAME = 'komodo';

// Verification
export const LOGIN_CONSENT_SIG_TIME_DIFF_THRESHOLD = 3600;

// System IDs
export const VRSC_SYSTEM_ID = 'i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV';
export const VRSCTEST_SYSTEM_ID = 'iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq';

// Permission Scopes
export const SCOPES = {
  [IDENTITY_VIEW.vdxfid]: {
    description: 'View your chosen identity',
  },
};
export const SUPPORTED_SCOPES = [IDENTITY_VIEW.vdxfid];

export const SUPPORTED_CREDENTIALS = [IDENTITY_CREDENTIAL_PLAINLOGIN.vdxfid];
