import React from "react";
import { List, Tooltip } from "@mui/material";

import {
    onBackgroundColor,
    onPrimaryColor,
    primaryColor,
} from "../../Shared/Style/Style-MainTheme";
import { environment } from "../../../environment";
import { LastUpdateDateComponent } from "./LastUpdate-Date.component";
import { LastUpdateVersionComponent } from "./LastUpdate-Version.component";

export function LastUpdateComponent(): JSX.Element {
    const { version } = environment;
    return (
        <Tooltip
            sx={{
                maxWidth: 200,
                marginBottom: "1.5em",
                marginLeft: "10px",
                color: onPrimaryColor,
                backgroundColor: primaryColor,
                border: `2px solid ${onBackgroundColor}`,
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
