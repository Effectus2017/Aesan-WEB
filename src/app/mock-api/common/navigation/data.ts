/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';
import { adminNavigation } from './navigation.admin';
import { agencyNavigation } from './navigation.agency';
import { monitorNavigation } from './navigation.monitor';
import { sharedNavigation } from './navigation.shared';

export const navigationByRole = {
  'Administrator': adminNavigation,
  'Agency-Administrator': agencyNavigation,
  'Monitor': monitorNavigation,
  'Shared': sharedNavigation
};

export { adminNavigation, agencyNavigation, monitorNavigation, sharedNavigation };
