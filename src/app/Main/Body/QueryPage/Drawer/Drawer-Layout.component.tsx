/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";
import { DrawerFilterComponent as Filter } from "./Filter/Drawer-Filter.component";
import { DrawerDisplayedFeaturesComponent as DisplFeatures } from "./Displayed_Features/Drawer-DisplFeatures.component";
import { primaryColor } from "../../../../Shared/Style/Style-MainTheme.component";

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

interface DrawerLayoutProps {
    isOpen: boolean;
    newWidth: number;
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
                <Filter />
                <Divider variant="middle" css={dividerStyle} />
                <DisplFeatures />
            </div>
        </Drawer>
    );
}
