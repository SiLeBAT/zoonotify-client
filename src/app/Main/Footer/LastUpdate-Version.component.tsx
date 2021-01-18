/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import { onPrimaryColor } from "../../Shared/Style/Style-MainTheme.component";

const distanceStyle = css`
    margin: 0;
    padding: 0;
`;
const listTextStyle = css`
    margin: 0;
    span {
        font-size: 0.75rem;
        font-style: italic;
    }
`;
const listIconStyle = css`
    min-width: min-content;
    margin: 0.2em;
    padding: 0;
`;
const dotIconStyle = css`
    font-size: 0.5rem;
    fill: ${onPrimaryColor};
`;

interface VersionProps {
    text: string;
}

/**
 * @desc Returns one ListItem for one version
 * @param {string} text - version text
 * @returns {JSX.Element} - listItem with icon and text
 */
export function LastUpdateVersionComponent(props: VersionProps): JSX.Element {
    return (
        <ListItem css={distanceStyle}>
            <ListItemIcon css={listIconStyle}>
                <FiberManualRecordIcon css={dotIconStyle} />
            </ListItemIcon>
            <ListItemText primary={props.text} css={listTextStyle} />
        </ListItem>
    );
}
