// https://eonet.gsfc.nasa.gov/api/v3/events?status=all
export type EONETEventGeometry = {
    magnitudeValue: number | null;
    magnitudeUnit: string | null;
    date: string;
    type: string;
    coordinates: number[];
}

export type EONETEventSource = {
    id: string;
    url: string;
}

export type EONETEventCategory = {
    id: string;
    title: string;
}

export type EONETEvent = {
    id: string;
    title: string;
    description: string | null;
    link: string;
    closed: string | null;
    categories: EONETEventCategory[];
    sources: EONETEventSource[];
    geometry: EONETEventGeometry[];
}

export type EONETResponse = {
    title: string;
    description: string;
    link: string;
    events: EONETEvent[];
}

// https://eonet.gsfc.nasa.gov/api/v3/categories
export type EONETCategory = {
    id: string;
    title: string;
    link: string;
    description: string;
    layers: string;
}

export type EONETCategoriesResponse = {
    title: string;
    description: string;
    link: string;
    categories: EONETCategory[]
}