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
    onHandleSelectAll: () => void;
    onHandleDeselectAll: () => void;
}): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);
    const handleClickSelectAll = (): void => {
        props.onHandleSelectAll();
    };
    const handleClickDeselectAll = (): void => {
        props.onHandleDeselectAll();
    };

    return (
        <div>
            <Button
                onClick={handleClickSelectAll}
                variant="outlined"
                color="primary"
                size="small"
                css={selectButtonStyle}
            >
                <CheckBoxIcon css={selectIconStyle}/>
                {t("FilterDialog.SelectAll")}
            </Button>
            <Button
                onClick={handleClickDeselectAll}
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
