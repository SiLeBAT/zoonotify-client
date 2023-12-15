import { CMSAttributeDTO } from "../../shared/model/CMS.model";

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
    section: string;
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
