import { City } from "./City";
import { Region } from "./Region";

export interface CityRegion {
    id: number;
    cityId: number;
    regionId: number;
    city?: City;
    region?: Region;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
}
