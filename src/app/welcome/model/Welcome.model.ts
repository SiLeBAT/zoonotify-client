import { CMSAttributeDTO } from "../../shared/model/CMS.model";

export interface WelcomeAttributesDTO extends CMSAttributeDTO {
    subheading: string;
    content: string;
}
