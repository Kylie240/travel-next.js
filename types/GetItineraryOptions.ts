interface GetItineraryOptions extends FilterOptions {
    filters?: FilterOptions,
    pagination?: {
        pageSize?: number;
        page?: number;
    }
}