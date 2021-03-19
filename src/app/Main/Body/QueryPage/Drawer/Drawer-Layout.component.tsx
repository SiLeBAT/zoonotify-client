/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { ValueType } from "react-select";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";
import { DrawerFilterComponent } from "./Filter/Drawer-Filter.component";
import { DrawerDisplayedFeaturesComponent } from "./Displayed_Features/Drawer-DisplFeatures.component";
import { primaryColor } from "../../../../Shared/Style/Style-MainTheme.component";
import { FilterType } from "../../../../Shared/Model/Filter.model";
import { TableType } from "../../../../Shared/Context/TableContext";

const dividerStyle = css`
    height: 0.15em;
    background: ${primaryColor};
`;
const useStyles = makeStyles(() =>
    createStyles({
        drawer: (newWidth: string) => ({
            width: `${newWidth}px`,
            minWidth: "325px",
            position: "relative",
            height: "100%",
            zIndex: 0,
        }),
        drawerPaper: {
            width: "inherit",
            zIndex: 0,
            position: "relative",
        },
        drawerContainer: {
            overflow: "auto",
            padding: "1em",
            height: "100%",
        },
    })
);

export interface DrawerLayoutProps {
    isOpen: boolean;
    newWidth: number;
    handleChangeDisplFeatures: (
        selectedOption: ValueType<{value: string, label: string}>,
        keyName: FilterType | TableType
    ) => void;
    handleSwapDisplFeatures: () => void;
    handleChangeFilter: (
        selectedOption: ValueType<{value: string, label: string}>,
        keyName: FilterType | TableType
    ) => void;
    handleRemoveAllFilter: () => void;
    handleRemoveAllDisplFeatures: () => void;
}

/**
 * @desc Returns the Drawer
 * @param {boolean} isOpen - true if Drawer is open
 * @param {number} newWidth - width of the Drawer (also after resize)
 * @returns {JSX.Element} - Drawer component
 */
export function DrawerLayoutComponent(props: DrawerLayoutProps): JSX.Element {
    const classes = useStyles((props.newWidth as unknown) as string);

    return (
        <Drawer
            className={classes.drawer}
            variant="persistent"
            anchor="left"
            open={props.isOpen}
            classes={{
                paper: classes.drawerPaper,
            }}
        >
            <div className={classes.drawerContainer}>
                <DrawerFilterComponent
                    handleChangeFilter={props.handleChangeFilter}
                    handleRemoveAllFilter={props.handleRemoveAllFilter}
                />
                <Divider variant="middle" css={dividerStyle} />
                <DrawerDisplayedFeaturesComponent
                    handleChangeDisplFeatures={props.handleChangeDisplFeatures}
                    handleSwapDisplFeatures={props.handleSwapDisplFeatures}
                    handleRemoveAllDisplFeatures={props.handleRemoveAllDisplFeatures}
                />
            </div>
        </Drawer>
    );
}
