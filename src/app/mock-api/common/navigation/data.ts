/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';
import { ROLE_KEY_ADMINISTRATOR, ROLE_KEY_AGENCY_ADMINISTRATOR } from 'app/shared/constants/role-keys';
import { adminNavigation } from './navigation.admin';
import { agencyNavigation } from './navigation.agency';
import { aesanNavigation } from './navigation.aesan';
import { sharedNavigation } from './navigation.shared';

export const navigationByRole: Record<string, FuseNavigationItem[]> = {
  [ROLE_KEY_ADMINISTRATOR]: adminNavigation,
  [ROLE_KEY_AGENCY_ADMINISTRATOR]: agencyNavigation,
  'Shared': sharedNavigation
};

export { adminNavigation, agencyNavigation, aesanNavigation, sharedNavigation };
