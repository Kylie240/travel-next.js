export interface ExplorePageDto {
                id: string;
                title: string,
                duration: number,
                shortDescription: string,
                mainImage: string,
                countries: string[],
                cities: string[],
                itineraryTags: string[],
                activityTags: string[],
                featuredCategories: string[],
                views: number,
                rating: number,
                price: number,
                likes: number,
                creatorId: string,
                creatorName: string,
                creatorImage: string;
              }