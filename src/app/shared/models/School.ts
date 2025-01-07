import { City } from "./City";
import { EducationLevel } from "./EducationLevel";
import { Facility } from "./Facility";
import { MealType } from "./MealType";
import { OperatingPeriod } from "./OperatingPeriod";
import { OrganizationType } from "./OrganizationType";
import { Region } from "./Region";

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
