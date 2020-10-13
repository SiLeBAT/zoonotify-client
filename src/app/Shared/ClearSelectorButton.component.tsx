/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import { useContext } from "react";
import { IconButton } from "@material-ui/core";
import CancelIcon from "@material-ui/icons/Cancel";
import { FilterType } from "./Filter.model";
import { defaultFilter, FilterContext } from "./Context/FilterContext";
import { primaryColor } from "./Style/Style-MainTheme.component";
import { defaultTable, TableContext, TableType } from "./Context/TableContext";

const buttonAreaStyle = (isMainButton: boolean): SerializedStyles => css`
    margin-top: ${isMainButton ? "auto" : "11px"};
    display: flex;
    align-items: center;
`;

const iconButtonStyle = css`
    height: fit-content;
    margin-left: 0.5em;
    padding: 0;
    color: ${primaryColor};
`;

interface RemoveButtonProps {
    mainButton: boolean;
    selectAttribute: FilterType | "all" | TableType;
    isFilter: boolean;
    isTabel: boolean;
}

export function ClearSelectorComponent(props: RemoveButtonProps): JSX.Element {
    const { filter, setFilter } = useContext(FilterContext);
    const { table, setTable } = useContext(TableContext);

    const handleRemove = (keyName: FilterType | "all" | TableType): void => {
        if (props.isFilter) {
            if (keyName === "all") {
                setFilter(defaultFilter);
            } else {
                setFilter({
                    ...filter,
                    [keyName]: [],
                });
            }
        } else if (props.isTabel) {
            if (keyName === "all") {
                setTable(defaultTable);
            } else {
                setTable({
                    ...table,
                    [keyName]: "",
                });
            }
        }
    };

    return (
        <div css={buttonAreaStyle(props.mainButton)}>
            <IconButton
                css={iconButtonStyle}
                onClick={() => handleRemove(props.selectAttribute)}
            >
                <CancelIcon />
            </IconButton>
        </div>
    );
}
