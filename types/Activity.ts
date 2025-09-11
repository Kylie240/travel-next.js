export type Activity = {
    id: string,
    time?: string,
    duration?: string,
    image?: string,
    title: string,
    description?: string,
    location?: string,
    type?: number,
    link?: string,
    photos?: string[],
    price?: number,
    expanded?: boolean,
}