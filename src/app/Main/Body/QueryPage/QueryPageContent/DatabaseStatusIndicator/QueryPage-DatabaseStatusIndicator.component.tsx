import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import {
    callApiService,
    ApiResponse,
} from "../../../../../Core/callApi.service";
import { DatabaseStatusDTO } from "../../../../../Shared/Model/Api_Database.model";
import { DATABASE_STATUS_URL } from "../../../../../Shared/URLs";

export function QueryPageDatabaseStatusIndicatorComponent(): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const [date, setDate] = useState("");

    useEffect(() => {
        callApiService<DatabaseStatusDTO>(DATABASE_STATUS_URL)
            .then((statusResponse: ApiResponse<DatabaseStatusDTO>) => {
                if (statusResponse.status === 200) {
                    setDate(statusResponse.data?.date || "");
                }
                return true;
            })
            .catch((error) => {
                throw error;
            });
    }, []);

    return date ? (
        <Typography sx={{ textAlign: "center" }}>
            {t("Content.DataStatus", { date })}
        </Typography>
    ) : (
        <p />
    );
}
