import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
// Models below can be kept, but type of response can be "any" for v5 if you're unsure
// import { CMSEntity, CMSResponse } from "../../../shared/model/CMS.model";
import {
    ApiResponse,
    callApiService,
} from "../../infrastructure/api/callApi.service";
import { CONFIGURATION } from "../../infrastructure/router/routes";
import { ErrorSnackbar } from "../ErrorSnackbar/ErrorSnackbar";
import { FooterLayoutComponent } from "./Footer-Layout.component";
import { FooterLinkListComponent } from "./Footer-LinkList.component";
import { LastUpdateComponent } from "./LastUpdate.component";
// import { ConfigurationAttributesDTO } from "../../model/Api_Info.model";

/**
 * Custom hook to fetch the support email from the API (Strapi v5 - flat).
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const infoResponse: ApiResponse<any> = await callApiService(
                    CONFIGURATION
                );
                console.log("API response for support email:", infoResponse);

                // 🚨 NOTE the new path!
                if (
                    infoResponse.data &&
                    infoResponse.data.data &&
                    infoResponse.data.data.supportEmail
                ) {
                    console.log(
                        "Fetched supportEmail:",
                        infoResponse.data.data.supportEmail
                    );
                    setSupportEmail(infoResponse.data.data.supportEmail);
                } else {
                    console.warn(
                        "Support email not found in API response (Strapi v5 structure)."
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
