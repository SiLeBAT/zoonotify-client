export type CMSResponse<T> = {
    id: number;
    attributes: T;
};

export interface CMSAttributeDTO {
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
}
export type DataContainer<T> = {
    data: T;
};
export type DiagramAttributes = { url: string };
