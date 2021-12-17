/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { List, ListItem, ListItemText, ListSubheader } from "@mui/material";

const listStyle = css`
    padding: 0;
    margin: 0 4em 0 0;
`;
const listHeaderStyle = css`
    position: relative;
`;
const spaceStyle = css`
    padding: 0;
    margin: 0;
`;
const parameterValue = css`
    margin-top: 0;
    margin-left: 2em;
    span {
        letter-spacing: 0;
    }
`;

export interface ListProps {
    parameterLabel: string;
    parameterNames: {
        parameterName: string | JSX.Element;
        key: string;
    }[];
}

export function ParameterListLayout(props: ListProps): JSX.Element {
    return (
        <List
            dense
            sx={{
                width: "11em",
            }}
            css={listStyle}
            subheader={
                <ListSubheader
                    component="div"
                    id="nested-list-subheader"
                    sx={{
                        paddingLeft: 0,
                        lineHeight: "20px",
                        color: "black",
                        fontWeight: "bold",
                    }}
                    css={listHeaderStyle}
                >
                    {props.parameterLabel}
                </ListSubheader>
            }
        >
            {props.parameterNames.map((parameterName) => (
                <ListItem
                    key={`listItem-${parameterName.key}`}
                    css={spaceStyle}
                >
                    <ListItemText
                        id={`labelId-${parameterName.key}`}
                        primary={parameterName.parameterName}
                        css={parameterValue}
                    />
                </ListItem>
            ))}
        </List>
    );
}
