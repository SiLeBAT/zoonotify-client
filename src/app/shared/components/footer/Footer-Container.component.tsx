import React, { useEffect, useState } from "react";
import { CMSEntity, CMSResponse } from "../../../shared/model/CMS.model";
import {
    ApiResponse,
    callApiService,
} from "../../infrastructure/api/callApi.service";
// eslint-disable-next-line import/named
import { CONFIGURATION } from "../../infrastructure/router/routes";
import { ConfigurationAttributesDTO } from "../../model/Api_Info.model";
import { FooterLayoutComponent } from "./Footer-Layout.component";
import { FooterLinkListComponent } from "./Footer-LinkList.component";
import { LastUpdateComponent } from "./LastUpdate.component";

export function FooterContainer(): JSX.Element {
    const [supportMail, setSupportMail] = useState<string>();

    const fetchAndSetContact = async (): Promise<void> => {
        const infoResponse: ApiResponse<
            CMSResponse<CMSEntity<ConfigurationAttributesDTO>, unknown>
        > = await callApiService(CONFIGURATION);

        if (infoResponse.data !== undefined) {
            setSupportMail(infoResponse.data.data.attributes.supportEmail);
        }
    };

    useEffect(() => {
        fetchAndSetContact();
    }, []);

    return (
        <FooterLayoutComponent
            lastUpdateComponent={<LastUpdateComponent />}
            linkListComponent={
                <FooterLinkListComponent supportMail={supportMail} />
            }
        />
    );
}
