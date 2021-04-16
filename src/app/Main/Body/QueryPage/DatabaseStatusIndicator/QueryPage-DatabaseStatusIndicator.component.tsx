/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import { callApiService, ApiResponse } from '../../../../Core/callApi.service';
import { DatabaseStatusDTO } from "../../../../Shared/Model/Api_Database.model";
import { DATABASE_STATUS_URL } from "../../../../Shared/URLs";

const statusStyle = css`
    text-align: center;
`;

export function QueryPageDatabaseStatusIndicatorComponent(): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const [date, setDate] = useState('');
    const [directive, setDirective] = useState('');

    useEffect(() => {
        callApiService<DatabaseStatusDTO>(DATABASE_STATUS_URL)
            .then((statusResponse: ApiResponse<DatabaseStatusDTO>) => {
                if (statusResponse.status === 200) {
                    setDate(statusResponse.data?.date || "");
                    setDirective(statusResponse.data?.directive || "");
                }
                return true;
            })
            .catch((error) => {
                throw error;
            });

    }, []);

    return date && directive ? <p css={statusStyle}>{t("Content.DataStatus", {date, directive})}</p> : <p />;
}
