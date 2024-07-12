import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CMSEntity, CMSResponse } from "../../../shared/model/CMS.model";
import {
    ApiResponse,
    callApiService,
} from "../../infrastructure/api/callApi.service";
import { CONFIGURATION } from "../../infrastructure/router/routes";
import { ErrorSnackbar } from "../ErrorSnackbar/ErrorSnackbar";
import { FooterLayoutComponent } from "./Footer-Layout.component";
import { FooterLinkListComponent } from "./Footer-LinkList.component";
import { LastUpdateComponent } from "./LastUpdate.component";
import { ConfigurationAttributesDTO } from "../../model/Api_Info.model";

// Custom hook to fetch and return the support email with explicit return type
export const useFetchSupportEmail = (): string | undefined => {
    const [supportMail, setSupportMail] = useState<string | undefined>();

    useEffect(() => {
        const fetchAndSetContact = async (): Promise<void> => {
            // Explicitly declared return type as void
            try {
                const infoResponse: ApiResponse<
                    CMSResponse<CMSEntity<{ supportEmail: string }>, unknown>
                > = await callApiService(CONFIGURATION);
                if (
                    infoResponse.data &&
                    infoResponse.data.data.attributes.supportEmail
                ) {
                    setSupportMail(
                        infoResponse.data.data.attributes.supportEmail
                    );
                }
            } catch (err) {
                console.error("Error fetching contact info: ", err);
            }
        };

        fetchAndSetContact();
    }, []);

    return supportMail;
};

export function FooterContainer(): JSX.Element {
    const [supportMail, setSupportMail] = useState<string>();
    const { t } = useTranslation(["Footer"]);
    const [error, setError] = useState<string | null>(null);

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
            {error && (
                <ErrorSnackbar open={!!error} handleClose={handleCloseError} />
            )}
        </>
    );
}
