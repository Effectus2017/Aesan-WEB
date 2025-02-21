export class CacheConfig {
    static readonly KEYS = {
        // Agencias
        AGENCIES: 'agencies',
        AGENCY: (id: number) => `agency_${id}`,
        AGENCY_PROGRAMS: (userId: string) => `agency_programs_${userId}`,

        // Programas
        PROGRAMS: 'programs',
        PROGRAM: (id: number) => `program_${id}`,

        // Regiones
        REGIONS: 'regions',
        REGION: (id: number) => `region_${id}`,

        // Ciudades
        CITIES: 'cities',
        CITY: (id: number) => `city_${id}`,

        // Estados
        STATUSES: 'statuses',
        STATUS: (id: number) => `status_${id}`,

        // Niveles educativos
        EDUCATION_LEVELS: 'education_levels',
        EDUCATION_LEVEL: (id: number) => `education_level_${id}`,

        // Instalaciones
        FACILITIES: 'facilities',
        FACILITY: (id: number) => `facility_${id}`,

        // Certificaciones de fondos federales
        FEDERAL_FUNDING_CERTIFICATIONS: 'federal_funding_certifications',
        FEDERAL_FUNDING_CERTIFICATION: (id: number) => `federal_funding_certification_${id}`,
    };

    static readonly TTL = {
        SHORT: 5 * 60 * 1000,  // 5 minutos
        MEDIUM: 15 * 60 * 1000, // 15 minutos
        LONG: 30 * 60 * 1000,  // 30 minutos
        VERY_LONG: 60 * 60 * 1000, // 1 hora
        AGENCY: 30 * 1000 // 30 segundos
    };

    static readonly CACHE_CONTROL = {
        NO_CACHE: 'no-cache',
        NO_STORE: 'no-store',
        MUST_REVALIDATE: 'must-revalidate'
    };
}
