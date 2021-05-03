/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Button } from "@material-ui/core";
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { useTranslation } from "react-i18next";

const selectButtonStyle = css`
    width: 100%;
    margin: 0 0 0.5em 0;
    display: flex;
    justify-content: flex-start;
`;
const selectIconStyle = css`
    margin-right: 0.25em;
`

export function FilterDialogSelectAllButtonComponent(props: {
    onSelectAllFiltersToDisplay: () => void;
    onDeselectAllFiltersToDisplay: () => void;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);
    const handleSelectAllFiltersToDisplay = (): void => {
        props.onSelectAllFiltersToDisplay();
    };
    const handleDeselectAllFiltersToDisplay = (): void => {
        props.onDeselectAllFiltersToDisplay();
    };

    return (
        <div>
            <Button
                onClick={handleSelectAllFiltersToDisplay}
                variant="outlined"
                color="primary"
                size="small"
                css={selectButtonStyle}
            >
                <CheckBoxIcon css={selectIconStyle}/>
                {t("FilterDialog.SelectAll")}
            </Button>
            <Button
                onClick={handleDeselectAllFiltersToDisplay}
                variant="outlined"
                color="primary"
                size="small"
                css={selectButtonStyle}
            >
                <CheckBoxOutlineBlankIcon css={selectIconStyle}/>
                {t("FilterDialog.DeselectAll")}
            </Button>
        </div>
    );
}
