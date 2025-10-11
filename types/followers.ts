export interface Followers {
    userId: string
    userName: string
    userUsername: string
    userAvatar: string
    isFollowing: boolean
    isBlocked?: boolean
    isPrivate?: boolean
}