/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { SubHeaderExportDialogComponent } from "./Dialog/SubHeader-ExportDialog.component";
import { SubHeaderExportButtonComponent } from "./SubHeader-ExportButton.component";
import { ExportButtonLabelComponent } from "../../../../Shared/Export-ButtonLabel.component";
import { bfrPrimaryPalette } from "../../../../Shared/Style/Style-MainTheme.component";

const subHeaderStyle = css`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    background-color: ${bfrPrimaryPalette[300]};
    box-sizing: border-box;
    box-shadow: 0 8px 6px -6px grey;
`;

export function SubHeaderLayoutComponent(props: {
    exportRowOrStatTable: {
        raw: boolean;
        stat: boolean;
        chart: boolean;
    };
    isOpen: boolean;
    isLoading: boolean;
    onExportTableChange: (name: string, checked: boolean) => void;
    onClickOpen: () => void;
    onHandleClose: () => void;
    onExportClick: () => void;
}): JSX.Element {
    const buttonLabel: JSX.Element = ExportButtonLabelComponent(props.isOpen);

    const handleChange = (name: string, checked: boolean): void => {
        props.onExportTableChange(name, checked);
    };
    const handleClickOpen = (): void => {
        props.onClickOpen();
    };
    const handleClose = (): void => {
        props.onHandleClose();
    };
    const handleExport = async (): Promise<void> => {
        props.onExportClick();
    };

    return (
        <div css={subHeaderStyle}>
            <SubHeaderExportButtonComponent
                onClickOpen={handleClickOpen}
                buttonLabel={buttonLabel}
            />
            {props.isOpen && (
                <SubHeaderExportDialogComponent
                    exportRowOrStatTable={props.exportRowOrStatTable}
                    buttonLabel={buttonLabel}
                    loading={props.isLoading}
                    onClickClose={handleClose}
                    onClickExport={handleExport}
                    onCheckboxChange={handleChange}
                />
            )}
        </div>
    );
}
