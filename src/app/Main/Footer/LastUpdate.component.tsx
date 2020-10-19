import React from "react";
import { List, Tooltip, withStyles } from "@material-ui/core";
import {
    onBackgroundColor,
    onPrimaryColor,
    primaryColor,
} from "../../Shared/Style/Style-MainTheme.component";
import { environment } from "../../../environment";
import { LastUpdateComponent } from "./LastUpdate-Date.component";
import { VersionListItemComponent as ListItem } from "./LastUpdate-VerstionItem.component";

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

export function LastUpdate(): JSX.Element {
    const { version } = environment;
    return (
        <HtmlTooltip
            arrow
            title={
                <>
                    <List dense>
                        <ListItem text={`server version@${version}`} />
                        <ListItem text={`client version@${version}`} />
                    </List>
                </>
            }
        >
            <span>
                <LastUpdateComponent />
            </span>
        </HtmlTooltip>
    );
}
