export interface City {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
}

export interface CityListView {
    data: City[];
    total: number;
}
