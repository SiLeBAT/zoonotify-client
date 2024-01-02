import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CMSEntity, CMSResponse } from "../../../shared/model/CMS.model";
import {
    ApiResponse,
    callApiService,
} from "../../infrastructure/api/callApi.service";
import { CONFIGURATION } from "../../infrastructure/router/routes";
import { ConfigurationAttributesDTO } from "../../model/Api_Info.model";
import { FooterLayoutComponent } from "./Footer-Layout.component";
import { FooterLinkListComponent } from "./Footer-LinkList.component";
import { LastUpdateComponent } from "./LastUpdate.component";
import { ErrorSnackbar } from "../ErrorSnackbar/ErrorSnackbar";

export function FooterContainer(): JSX.Element {
    const [supportMail, setSupportMail] = useState<string>();
    const [error, setError] = useState<string | null>(null); // State to manage error
    const { t } = useTranslation();

    const fetchAndSetContact = async (): Promise<void> => {
        try {
            const infoResponse: ApiResponse<
                CMSResponse<CMSEntity<ConfigurationAttributesDTO>, unknown>
            > = await callApiService(CONFIGURATION);

            if (infoResponse.data !== undefined) {
                setSupportMail(infoResponse.data.data.attributes.supportEmail);
            }
        } catch (err) {
            setError(t("unknownError"));
            console.error("Error fetching contact info: ", err);
        }
    };

    useEffect(() => {
        fetchAndSetContact();
    }, []);

    const handleCloseError = (): void => {
        setError(null);
    };

    return (
        <>
            <FooterLayoutComponent
                lastUpdateComponent={<LastUpdateComponent />}
                linkListComponent={
                    <FooterLinkListComponent supportMail={supportMail} />
                }
            />
            {/* ErrorSnackbar component to display errors */}
            {error && (
                <ErrorSnackbar open={!!error} handleClose={handleCloseError} />
            )}
        </>
    );
}
