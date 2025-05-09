import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { SchoolService } from 'app/shared/services/school.service';
import { GeoService } from 'app/shared/services/geo.service';
import { OrganizationTypeService } from 'app/shared/services/organization-type.service';
import { EducationLevelService } from 'app/shared/services/education-level.service';
import { OperatingPeriodService } from 'app/shared/services/operating-period.service';
import { FacilityService } from 'app/shared/services/facility.service';
import { OperatingPolicyService } from 'app/shared/services/operating-policy.service';
import { forkJoin } from 'rxjs';

export const initialDataSchoolsListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const schoolService = inject(SchoolService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };

  return forkJoin([
    schoolService.getAllSchoolsFromDb(requestParameters)
  ]);
};

export const initialDataSchoolsAddResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const schoolService = inject(SchoolService);
  const geoService = inject(GeoService);
  const organizationTypeService = inject(OrganizationTypeService);
  const educationLevelService = inject(EducationLevelService);
  const operatingPeriodService = inject(OperatingPeriodService);
  const facilityService = inject(FacilityService);
  const operatingPolicyService = inject(OperatingPolicyService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };

  return forkJoin([
    schoolService.getAllSchoolsFromDb(requestParameters),
    geoService.getCitiesFromDb(requestParameters),
    geoService.getRegionsFromDb(requestParameters),
    organizationTypeService.getAllOrganizationTypesFromDb(requestParameters),
    educationLevelService.getAllEducationLevelsFromDb(requestParameters),
    operatingPeriodService.getAllOperatingPeriodsFromDb(requestParameters),
    facilityService.getAllFacilitiesFromDb(requestParameters),
    operatingPolicyService.getAllOperatingPoliciesFromDb(requestParameters),
  ]);
};
