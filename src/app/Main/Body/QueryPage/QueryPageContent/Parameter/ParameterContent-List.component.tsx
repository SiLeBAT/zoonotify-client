/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { List, ListSubheader } from "@mui/material";
import { FilterType } from "../../../../../Shared/Model/Filter.model";

const listStyle = css`
    padding: 0;
    margin: 0 4em 0 0;
`;
const listHeaderStyle = css`
    position: relative;
`;

export interface ListProps {
    parameterLabel: FilterType;
    parameterValuesList: JSX.Element[];
}

export function ParameterContentListComponent(props: ListProps): JSX.Element {
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
            {props.parameterValuesList}
        </List>
    );
}
