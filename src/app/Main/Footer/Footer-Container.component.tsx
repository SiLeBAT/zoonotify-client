import React, { useEffect, useState } from "react";
import { ApiResponse, callApiService } from "../../Core/callApi.service";
import { INFO_URL } from "../../Shared/URLs";
import { InfoDTO } from "../../Shared/Model/Api_Info.model";
import { FooterLayoutComponent } from "./Footer-Layout.component";
import { LastUpdateComponent } from "./LastUpdate.component";
import { FooterLinkListComponent } from "./Footer-LinkList.component";

export function FooterContainer(): JSX.Element {
    const [supportMail, setSupportMail] = useState<string>();

    const fetchAndSetContact = async (): Promise<void> => {
        const infoResponse: ApiResponse<InfoDTO> = await callApiService(
            INFO_URL
        );

        if (infoResponse.data !== undefined) {
            setSupportMail(infoResponse.data.supportContact);
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
