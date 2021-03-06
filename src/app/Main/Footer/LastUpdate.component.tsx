import React from "react";
import { List, Tooltip, withStyles } from "@material-ui/core";
import {
    onBackgroundColor,
    onPrimaryColor,
    primaryColor,
} from "../../Shared/Style/Style-MainTheme.component";
import { environment } from "../../../environment";
import { LastUpdateDateComponent } from "./LastUpdate-Date.component";
import { LastUpdateVersionComponent } from "./LastUpdate-Version.component";

const HtmlTooltip = withStyles(() => ({
    tooltip: {
        maxWidth: 200,
        marginBottom: "1.5em",
        marginLeft: "10px",
        color: onPrimaryColor,
        backgroundColor: primaryColor,
        border: `2px solid ${onBackgroundColor}`,
    },
    arrow: {
        fontSize: "20px",
        color: primaryColor,
    },
}))(Tooltip);

export function LastUpdateComponent(): JSX.Element {
    const { version } = environment;
    return (
        <HtmlTooltip
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
        </HtmlTooltip>
    );
}
