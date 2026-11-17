import React, { useSyncExternalStore } from "react";
import { Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
    isCmsAvailable,
    subscribeToCmsAvailability,
} from "../../infrastructure/api/cmsAvailability";

/**
 * App-wide warning shown while the CMS cannot deliver data, so an empty page
 * reads as "server down, try later" rather than "there is no data".
 */
export function CmsOutageNotice(): JSX.Element | null {
    const { t } = useTranslation(["ErrorPage"]);
    const available = useSyncExternalStore(
        subscribeToCmsAvailability,
        isCmsAvailable
    );

    if (available) return null;

    return (
        <Alert severity="warning" role="alert" sx={{ borderRadius: 0 }}>
            {t("CmsUnavailable")}
        </Alert>
    );
}
