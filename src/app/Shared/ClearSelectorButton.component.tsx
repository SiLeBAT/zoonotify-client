/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useContext } from "react";
import { IconButton } from "@material-ui/core";
import CancelIcon from "@material-ui/icons/Cancel";
import { FilterType } from "./Filter.model";
import { defaultFilter, FilterContext } from "./Context/FilterContext";
import { primaryColor } from "./Style/Style-MainTheme.component";
import { TableContext } from "./Context/TableContext";

const buttonAreaStyle = css`
    margin-top: auto;
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
    isFilter: boolean;
    isTabel: boolean;
}

export function ClearSelectorComponent(props: RemoveButtonProps): JSX.Element {
    const { setFilter } = useContext(FilterContext);
    const { table, setTable } = useContext(TableContext);

    const handleRemove = (): void => {
        if (props.isFilter) {
            setFilter(defaultFilter);
        } else if (props.isTabel) {
            setTable({
                ...table,
                row: "" as FilterType,
                column: "" as FilterType,
            });
        }
    };

    return (
        <div css={buttonAreaStyle}>
            <IconButton css={iconButtonStyle} onClick={() => handleRemove()}>
                <CancelIcon />
            </IconButton>
        </div>
    );
}
