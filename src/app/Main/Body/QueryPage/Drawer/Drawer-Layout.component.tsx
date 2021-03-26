/** @jsx jsx */
import { css, jsx } from "@emotion/core";
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
    /**
     * true if Drawer is open
     */
    isOpen: boolean;
    /**
     * width of the Drawer (also after resize)
     */
    newWidth: number;
    onDisplFeaturesChange: (
        selectedOption: { value: string; label: string },
        keyName: FilterType | TableType
    ) => void;
    onDisplFeaturesSwap: () => void;
    onDisplFeaturesRemoveAll: () => void;
    onFilterChange: (
        selectedOption: { value: string; label: string }[],
        keyName: FilterType | TableType
    ) => void;
    onFilterRemoveAll: () => void;
}

/**
 * @desc Returns the Drawer
 * @param {DrawerLayoutProps} props
 * @returns {JSX.Element} - Drawer component
 */
export function DrawerLayoutComponent(props: DrawerLayoutProps): JSX.Element {
    const classes = useStyles((props.newWidth as unknown) as string);

    const handleChangeDisplFeatures = (
        selectedOption: { value: string; label: string },
        keyName: FilterType | TableType
    ): void => props.onDisplFeaturesChange(selectedOption, keyName);
    const handleSwapDisplFeatures = (): void => props.onDisplFeaturesSwap();
    const handleRemoveAllDisplFeatures = (): void =>
        props.onDisplFeaturesRemoveAll();

    const handleChangeFilter = (
        selectedOption: { value: string; label: string }[],
        keyName: FilterType | TableType
    ): void => props.onFilterChange(selectedOption, keyName);
    const handleRemoveAllFilter = (): void => props.onFilterRemoveAll();

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
                    onFilterChange={handleChangeFilter}
                    onFilterRemoveAll={handleRemoveAllFilter}
                />
                <Divider variant="middle" css={dividerStyle} />
                <DrawerDisplayedFeaturesComponent
                    onDisplFeaturesChange={handleChangeDisplFeatures}
                    onDisplFeaturesSwap={handleSwapDisplFeatures}
                    onDisplFeaturesRemoveAll={handleRemoveAllDisplFeatures}
                />
            </div>
        </Drawer>
    );
}
