export interface Region {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
}

export interface RegionListView {
    data: Region[]
    total: number
}
