export const ItineraryStatusEnum = {
    pending: 0,
    draft: 1,
    published: 2,
    archived: 3,
    restricted: 4,
    deleted: 5,
}

export const ItineraryStatusEnumString = {
    0: "Pending",
    1: "Draft",
    2: "Published",
    3: "Archived",
    4: "Restricted",
    5: "Deleted",
}

export const viewPermissionEnum = {
    public: 1,
    creator: 2,
    restricted: 3,
}

export const editPermissionEnum = {
    creator: 1,
    collaborators: 2,
}