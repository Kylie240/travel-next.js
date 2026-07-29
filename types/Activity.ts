export type Activity = {
    id: number,
    /** 1-based display/order index within a day */
    activityNumber?: number,
    time?: string,
    duration?: number,
    image?: string,
    title: string,
    description?: string,
    location?: string,
    type?: number,
    link?: string,
    photos?: string[],
    price?: number,
    expanded?: boolean,
    showActivity?:boolean,
}