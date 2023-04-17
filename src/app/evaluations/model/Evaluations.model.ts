export type DivisionToken = "FUTTERMITTEL" | "TIERE" | "LEBENSMITTEL";

export type EvaluationEntry = {
    title: string;
    description: string;
    category: string;
    division: string;
    microorganism: string;
    diagramType: string;
    productionType: string;
    matrix: string;
    otherDetails: string;
    chartPath: string;
};

export type DivisionData = EvaluationEntry[];

export type Evaluation = Record<DivisionToken, DivisionData>;

export type EvaluationPaths = Record<DivisionToken, Record<string, string>>;

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
export interface EvaluationAttributesDTO extends CMSAttributeDTO {
    title: string;
    description: string;
    category: string;
    division: string;
    microorganism: string;
    diagramType: string;
    productionType: string;
    matrix: string;
    otherDetails: string;
    diagram: DataContainer<CMSResponse<DiagramAttributes>[]>;
}
export interface SelectionItem {
    value: string;
    displayName: string;
}

export type FilterSelection = {
    matrix: string[];
    otherDetail: string[];
    productionType: string[];
    diagramType: string[];
    category: string[];
    microorganism: string[];
    division: string[];
};

export type SelectionFilterConfig = {
    label: string;
    id: string;
    selectedItems: string[];
    selectionOptions: SelectionItem[];
    handleChange: (event: { target: { value: string } }) => void;
};
