import { Itinerary } from "@/types/itinerary";

export interface PhotoItem {
  id: string;
  url: string;
  title: string;
  type: 'main' | 'day' | 'activity' | 'accommodation';
  dayTitle?: string;
  activityTitle?: string;
  accommodationName?: string;
}

export function collectAllPhotos(itinerary: Itinerary): PhotoItem[] {
  const photos: PhotoItem[] = [];

  // Add main itinerary image
  if (itinerary.mainImage) {
    photos.push({
      id: 'main',
      url: itinerary.mainImage,
      title: itinerary.title,
      type: 'main'
    });
  }

  // Add day images and activity/accommodation photos
  itinerary.days.forEach((day, dayIndex) => {
    // Add day image
    if (day.image) {
      photos.push({
        id: `day-${dayIndex}`,
        url: day.image,
        title: day.title,
        type: 'day',
        dayTitle: day.title
      });
    }

    // Add activity images
    if (day.activities) {
      day.activities.forEach((activity, activityIndex) => {
        // Add main activity image
        if (activity.image) {
          photos.push({
            id: `activity-${dayIndex}-${activityIndex}`,
            url: activity.image,
            title: activity.title,
            type: 'activity',
            dayTitle: day.title,
            activityTitle: activity.title
          });
        }

        // Add activity photos array
        if (activity.photos) {
          activity.photos.forEach((photo, photoIndex) => {
            photos.push({
              id: `activity-photo-${dayIndex}-${activityIndex}-${photoIndex}`,
              url: photo,
              title: activity.title,
              type: 'activity',
              dayTitle: day.title,
              activityTitle: activity.title
            });
          });
        }
      });
    }

    // Add accommodation photos
    if (day.accommodation && day.accommodation.photos) {
      day.accommodation.photos.forEach((photo, photoIndex) => {
        photos.push({
          id: `accommodation-${dayIndex}-${photoIndex}`,
          url: photo,
          title: day.accommodation.name,
          type: 'accommodation',
          dayTitle: day.title,
          accommodationName: day.accommodation.name
        });
      });
    }
  });

  console.log("photos", photos)
  return photos;
}
