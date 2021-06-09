/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";

const selectButtonStyle = css`
    width: 100%;
    margin: 0 0 0.5em 0;
    display: flex;
    justify-content: flex-start;
`;

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
                {t("FilterDialog.SelectAll")}
            </Button>
            <Button
                onClick={handleDeselectAllFiltersToDisplay}
                variant="outlined"
                color="primary"
                size="small"
                css={selectButtonStyle}
            >
                {t("FilterDialog.DeselectAll")}
            </Button>
        </div>
    );
}
