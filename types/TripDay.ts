export interface TripDay {
    id: string;
    image?: string;
    cityName: string;
    countryName: string;
    title: string;
    description: string;
    notes?: string;
    activities: Array<{
      id: string;
      time?: string;
      duration?: string;
      image?: string;
      title: string;
      description?: string;
      type: 'food' | 'sightseeing' | 'culture' | 'transportation' | 'accommodation';
      link?: string; // Make link optional to match the schema
      photos?: string[];
      price?: number;
    }>;
    showAccommodation: boolean;
    accommodation: {
      name: string;
      type: string;
      location: string;
      price?: number;
      photos?: string[];
      link?: string;
    };
  }