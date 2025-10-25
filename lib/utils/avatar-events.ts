// Custom event system for avatar and profile updates
export const AVATAR_UPDATE_EVENT = 'avatar-updated';
export const PROFILE_UPDATE_EVENT = 'profile-updated';

export interface AvatarUpdateEvent {
  userId: string;
  avatarUrl: string;
}

export interface ProfileUpdateEvent {
  userId: string;
  updatedFields: {
    name?: string;
    username?: string;
    bio?: string;
    location?: string;
  };
}

export const dispatchAvatarUpdate = (userId: string, avatarUrl: string) => {
  const event = new CustomEvent(AVATAR_UPDATE_EVENT, {
    detail: { userId, avatarUrl } as AvatarUpdateEvent
  });
  window.dispatchEvent(event);
};

export const dispatchProfileUpdate = (userId: string, updatedFields: ProfileUpdateEvent['updatedFields']) => {
  const event = new CustomEvent(PROFILE_UPDATE_EVENT, {
    detail: { userId, updatedFields } as ProfileUpdateEvent
  });
  window.dispatchEvent(event);
};

export const listenToAvatarUpdates = (
  callback: (event: CustomEvent<AvatarUpdateEvent>) => void
) => {
  const handleEvent = (event: Event) => {
    callback(event as CustomEvent<AvatarUpdateEvent>);
  };
  
  window.addEventListener(AVATAR_UPDATE_EVENT, handleEvent);
  
  return () => {
    window.removeEventListener(AVATAR_UPDATE_EVENT, handleEvent);
  };
};

export const listenToProfileUpdates = (
  callback: (event: CustomEvent<ProfileUpdateEvent>) => void
) => {
  const handleEvent = (event: Event) => {
    callback(event as CustomEvent<ProfileUpdateEvent>);
  };
  
  window.addEventListener(PROFILE_UPDATE_EVENT, handleEvent);
  
  return () => {
    window.removeEventListener(PROFILE_UPDATE_EVENT, handleEvent);
  };
};
