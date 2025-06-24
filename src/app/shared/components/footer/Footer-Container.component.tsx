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

/**
 * Custom hook to fetch the support email from the API (mx srAPI version 5).
 * It returns the support email, any error message, and a function to clear errors.
 */
export const useFetchSupportEmail = (): {
    supportEmail: string | undefined;
    error: string | null;
    clearError: () => void;
} => {
    const [supportEmail, setSupportEmail] = useState<string | undefined>();
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation(["Footer"]);

    useEffect(() => {
        const fetchAndSetContact = async (): Promise<void> => {
            try {
                const infoResponse: ApiResponse<
                    CMSResponse<CMSEntity<ConfigurationAttributesDTO>, unknown>
                > = await callApiService(CONFIGURATION);
                // Ensure the nested structure matches the API version 5 response.
                if (
                    infoResponse.data &&
                    infoResponse.data.data &&
                    infoResponse.data.data.attributes &&
                    infoResponse.data.data.attributes.supportEmail
                ) {
                    setSupportEmail(
                        infoResponse.data.data.attributes.supportEmail
                    );
                }
            } catch (err) {
                console.error("Error fetching contact info: ", err);
                setError(t("unknownError"));
            }
        };

        fetchAndSetContact();
    }, [t]);

    const clearError = (): void => setError(null);

    return { supportEmail, error, clearError };
};

/**
 * FooterContainer component that uses the custom hook to fetch the support email.
 * It renders the footer layout along with the last update and link list components,
 * and displays an error snackbar if any error occurs.
 */
export function FooterContainer(): JSX.Element {
    const { supportEmail, error, clearError } = useFetchSupportEmail();

    return (
        <>
            <FooterLayoutComponent
                lastUpdateComponent={<LastUpdateComponent />}
                linkListComponent={
                    <FooterLinkListComponent supportMail={supportEmail} />
                }
            />
            {error && <ErrorSnackbar open={true} handleClose={clearError} />}
        </>
    );
}
