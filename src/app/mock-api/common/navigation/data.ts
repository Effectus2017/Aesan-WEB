/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';
import { adminNavigation } from './navigation.admin';
import { agencyNavigation } from './navigation.agency';
import { aesanNavigation } from './navigation.aesan';
import { sharedNavigation } from './navigation.shared';

export const navigationByRole = {
  'Administrator': adminNavigation,
  'Agency-Administrator': agencyNavigation,
  'Monitor': aesanNavigation,
  'Shared': sharedNavigation
};

export { adminNavigation, agencyNavigation, aesanNavigation, sharedNavigation };
