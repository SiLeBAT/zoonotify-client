export const MAX_PAGE_SIZE = 900;

export type CMSResponse<T, V> = {
    data: T;
    meta?: V;
};

export type CMSEntity<T> = {
    id: number;
    attributes: T;
};

export interface CMSAttributeDTO {
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale?: string;
}
export type DataContainer<T> = {
    data: T;
};
export type MediaAttributes = { url: string };
