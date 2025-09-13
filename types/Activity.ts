export type Activity = {
    id: number,
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