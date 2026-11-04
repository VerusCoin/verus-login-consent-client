import {
  APP_ENCRYPTION_REQUEST_VDXF_ORDINAL,
  AUTHENTICATION_REQUEST_VDXF_ORDINAL,
  DATA_PACKET_REQUEST_VDXF_ORDINAL,
  GenericRequest,
  IDENTITY_UPDATE_REQUEST_VDXF_ORDINAL,
  OrdinalVDXFObject,
  PROVISION_IDENTITY_DETAILS_VDXF_ORDINAL,
  SPENDABLE_KEY_DETAILS_VDXF_ORDINAL,
  USER_DATA_REQUEST_VDXF_ORDINAL,
} from 'verus-typescript-primitives';

import {AppDispatch, RootState} from '#/redux/store';
import {
  CREDENTIALS_REVIEW,
  DATA_PACKET_REVIEW,
  IDENTITY_UPDATE_CONTENTMULTIMAP,
  IDENTITY_UPDATE_CORE,
  PROVISIONING_CONFIRM,
  PROVISIONING_FORM,
  PROVISIONING_RESULT,
  SELECT_LOGIN_ID,
  SPENDABLE_KEY_UNLOCK,
} from '#/utils/constants';

import {generateAppEncryptionResponse, prepareAppEncryptionDetail} from './appEncryption';
import {generateAuthenticationResponse, prepareAuthenticationDetail} from './authentication';
import {generateDataPacketResponse, prepareDataPacketDetail} from './dataPacket';
import {generateIdentityUpdateResponse, prepareIdentityUpdateDetail} from './identityUpdate';
import {prepareProvisionIdentityDetail} from './provisionIdentity';
import {prepareSpendableKeyDetail} from './spendableKey';
import {DetailMapEntry, DetailPrepFunction, DetailResponse, DetailResponseGenerator} from './types';
import {generateUserDataResponse, prepareUserDataDetail} from './userData';

const noOpPrepFunction: DetailPrepFunction = async () => {};

const noOpResponseGenerator: DetailResponseGenerator = async () => null;

/**
 * Central map of detail types to their navigation configuration.
 *
 * Each entry defines:
 * - `type`: How the detail participates in the navigation flow
 *   - `standard`: has one or more UI screens
 *   - `headless`: no UI, prep and response run automatically
 *   - `detour`: has UI, interrupts the normal flow (e.g. provisioning)
 * - `prepFunction`: Runs before the first screen is shown, or for headless, before response generation
 * - `screens`: Ordered array of screen path constants the user navigates through
 * - `responseGenerator`: Produces the response detail once the user completes all screens
 */
const DETAIL_MAP: Record<string, DetailMapEntry> = {
  [AUTHENTICATION_REQUEST_VDXF_ORDINAL.toNumber()]: {
    type: 'standard',
    prepFunction: prepareAuthenticationDetail,
    screens: [SELECT_LOGIN_ID],
    responseGenerator: generateAuthenticationResponse,
  },
  [USER_DATA_REQUEST_VDXF_ORDINAL.toNumber()]: {
    type: 'standard',
    prepFunction: prepareUserDataDetail,
    screens: [CREDENTIALS_REVIEW],
    responseGenerator: generateUserDataResponse,
  },
  [IDENTITY_UPDATE_REQUEST_VDXF_ORDINAL.toNumber()]: {
    type: 'standard',
    prepFunction: prepareIdentityUpdateDetail,
    screens: [IDENTITY_UPDATE_CORE, IDENTITY_UPDATE_CONTENTMULTIMAP],
    responseGenerator: generateIdentityUpdateResponse,
  },
  [APP_ENCRYPTION_REQUEST_VDXF_ORDINAL.toNumber()]: {
    type: 'headless',
    prepFunction: prepareAppEncryptionDetail,
    screens: [],
    responseGenerator: generateAppEncryptionResponse,
  },
  [DATA_PACKET_REQUEST_VDXF_ORDINAL.toNumber()]: {
    type: 'standard',
    prepFunction: prepareDataPacketDetail,
    screens: [DATA_PACKET_REVIEW],
    responseGenerator: generateDataPacketResponse,
  },
  [PROVISION_IDENTITY_DETAILS_VDXF_ORDINAL.toNumber()]: {
    type: 'detour',
    prepFunction: prepareProvisionIdentityDetail,
    screens: [PROVISIONING_FORM, PROVISIONING_CONFIRM, PROVISIONING_RESULT],
    responseGenerator: noOpResponseGenerator,
  },
  [SPENDABLE_KEY_DETAILS_VDXF_ORDINAL.toNumber()]: {
    type: 'standard',
    prepFunction: prepareSpendableKeyDetail,
    screens: [SPENDABLE_KEY_UNLOCK],
    responseGenerator: noOpResponseGenerator,
  },
};

/**
 * Finds the detail map entry for a given ordinal.
 * Throws if the detail type is not registered in the map.
 */
export const getDetailMapEntry = (detail: OrdinalVDXFObject): DetailMapEntry => {
  const key = detail.type.toNumber();
  const entry = DETAIL_MAP[key];

  if (!entry) {
    throw new Error(`Unknown detail type: ${detail.type}. No entry in DETAIL_MAP.`);
  }

  return entry;
};

/**
 * Safely gets a detail from the request based on the index.
 * Returns null if the index is out of bounds.
 */
export const getDetailByIndex = (
  request: GenericRequest,
  currentDetailIndex: number
): OrdinalVDXFObject | null => {
  if (currentDetailIndex < 0 || currentDetailIndex >= request.details.length) {
    return null;
  }

  return request.details[currentDetailIndex];
};

/**
 * Determines the starting navigation path for a given detail.
 * Returns the first screen from the detail map, or null for headless details.
 */
export const getStartPathForDetail = (detail: OrdinalVDXFObject): string | null => {
  const entry = getDetailMapEntry(detail);
  return entry.screens.length > 0 ? entry.screens[0] : null;
};

export const runDetailPrepFunction = async (
  detail: OrdinalVDXFObject,
  detailIndex: number,
  dispatch: AppDispatch,
  getState: () => RootState
): Promise<void> => {
  const entry = getDetailMapEntry(detail);
  await entry.prepFunction(detail, detailIndex, dispatch, getState);
};

/**
 * Generates a response detail from the current Redux state using the detail map.
 * Returns null if there should be no response detail.
 */
export async function generateDetailResponse(
  request: GenericRequest,
  detailIndex: number,
  getState: () => RootState
): Promise<DetailResponse> {
  const detail = getDetailByIndex(request, detailIndex);

  if (!detail) {
    console.error(`Invalid detail index: ${detailIndex}`);
    return null;
  }

  const entry = getDetailMapEntry(detail);
  return entry.responseGenerator(request, detailIndex, getState);
}

export const validateDetailTransition = (
  currentDetailIndex: number,
  totalDetails: number
): void => {
  if (currentDetailIndex < 0) {
    throw new Error(`Invalid detail index: ${currentDetailIndex}. Index cannot be negative.`);
  }

  if (currentDetailIndex >= totalDetails) {
    throw new Error(
      `Invalid detail index: ${currentDetailIndex}. ` +
        `Request only has ${totalDetails} detail(s).`
    );
  }
};

export const isLastDetail = (request: GenericRequest, currentDetailIndex: number): boolean => {
  if (!request || !request.details || request.details.length === 0) {
    return false;
  }

  return currentDetailIndex === request.details.length - 1;
};
