// Custom event system for avatar updates
export const AVATAR_UPDATE_EVENT = 'avatar-updated';

export interface AvatarUpdateEvent {
  userId: string;
  avatarUrl: string;
}

export const dispatchAvatarUpdate = (userId: string, avatarUrl: string) => {
  const event = new CustomEvent(AVATAR_UPDATE_EVENT, {
    detail: { userId, avatarUrl } as AvatarUpdateEvent
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
