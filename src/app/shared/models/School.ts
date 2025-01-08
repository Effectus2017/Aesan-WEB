import { City } from './City';
import { Region } from './Region';
import { EducationLevel } from './EducationLevel';
import { OperatingPeriod } from './OperatingPeriod';
import { OrganizationType } from './OrganizationType';
import { Facility } from './Facility';
import { MealType } from './MealType';

export interface School {
  id: number;
  name: string;
  address: string;
  zipCode: number;
  city: City;
  region: Region;
  educationLevel: EducationLevel;
  operatingPeriod: OperatingPeriod;
  organizationType: OrganizationType;
  facilities: Facility[];
  mealTypes: MealType[];
}
