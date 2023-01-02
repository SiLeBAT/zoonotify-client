import { List, Tooltip } from "@mui/material";
import { useTheme } from "@mui/system";
import React from "react";
import { environment } from "../../../../environment";
import { LastUpdateDateComponent } from "./LastUpdate-Date.component";
import { LastUpdateVersionComponent } from "./LastUpdate-Version.component";

export function LastUpdateComponent(): JSX.Element {
    const { version } = environment;
    const theme = useTheme();
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
                        <LastUpdateVersionComponent
                            text={`server version@${version}`}
                        />
                        <LastUpdateVersionComponent
                            text={`client version@${version}`}
                        />
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
