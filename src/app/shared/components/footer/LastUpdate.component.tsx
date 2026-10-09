import { List, Tooltip } from "@mui/material";
import { useTheme } from "@mui/system";
import React from "react";
import { environment } from "../../../../environment";
import { LastUpdateDateComponent } from "./LastUpdate-Date.component";
import { LastUpdateVersionComponent } from "./LastUpdate-Version.component";

export function LastUpdateComponent(): JSX.Element {
    const { version, commitHash } = environment;
    const theme = useTheme();
    const cmsVersion = window.sessionStorage.getItem("cms-version");
    // On QA both sides report the short hash of the deployed commit; elsewhere
    // they report their package version.
    const cmsCommit = window.sessionStorage.getItem("cms-commit");
    const serverText = cmsCommit
        ? `server commit@${cmsCommit}`
        : `server version@${cmsVersion}`;
    const clientText = commitHash
        ? `client commit@${commitHash}`
        : `client version@${version}`;
    return (
        <Tooltip
            sx={{
                maxWidth: 200,
                marginBottom: "1.5em",
                marginLeft: "10px",
                color: theme.palette.primary.contrastText,
                backgroundColor: theme.palette.primary.main,
                border: `2px solid ${theme.palette.text.primary}`,
            }}
            arrow
            title={
                <>
                    <List dense>
                        <LastUpdateVersionComponent text={serverText} />
                        <LastUpdateVersionComponent text={clientText} />
                    </List>
                </>
            }
        >
            <span>
                <LastUpdateDateComponent />
            </span>
        </Tooltip>
    );
}
