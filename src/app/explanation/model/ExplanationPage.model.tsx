// ExplanationPage.model.ts

import { CMSAttributeDTO } from "../../shared/model/CMS.model";

// -------------------------------------
// Existing definitions (unchanged)
// -------------------------------------
export interface AmrsTableData {
    shortSubstance: string;
    substanceClass: string;
    wirkstoff: string;
    amrSubstance: string;
    concentrationList: Record<
        string,
        {
            cutOff: string;
            min: string;
            max: string;
        }
    >;
}

export interface AmrsTable {
    introduction: JSX.Element;
    title: JSX.Element;
    titleString: string;
    description: string;
    tableHeader: string[];
    tableSubHeader: Record<string, string[]>;
    tableRows: AmrsTableData[];
}

export type AmrKey = "1" | "2" | "3a" | "3b" | "4" | "5a" | "5b";

export interface MicroorgaNamePart {
    name: string;
    letter?: string;
    subname?: string;
}
export type MicroorgaName = MicroorgaNamePart;

export interface ExplanationDTO {
    title: string;
    description: string;
    anchor: string; // <-- NEW: used for #hash and element id

    section: string;
    // If you want a separate field for the translation:
    translatedSection?: string;
}

export interface ExplanationAttributesDTO
    extends CMSAttributeDTO,
        ExplanationDTO {}

export type ExplanationCollection = {
    [key: string]: ExplanationDTO[];
};

export interface AMRTablesDTO {
    table_id: string;
    description: string;
    title: string;
    yearly_cut_off: JSON;
}

export interface AMRTableAttributesDTO extends CMSAttributeDTO, AMRTablesDTO {}

export interface ExplanationItem {
    id: number;
    title: string;
    description: string;
    section: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
    // Add more fields if your Strapi entries have them
}

export interface ExplanationAPIResponse {
    data: ExplanationItem[];
    meta: {
        // If you have pagination, define it here
        pagination?: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}
