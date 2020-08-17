/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";
import { FilterSettingsComponent as FilterSettings } from "./Drawer-FilterSettings.component";
import { GraphSettingsComponent as GraphSettings } from "./Drawer-GraphSettings.component";
import { primaryColor } from "../../../../Shared/Style/Style-MainTheme.component";

const drawerWidth = 433;

const deviderStyle = css`
    height: 0.15em;
    background: ${primaryColor};
`;
const useStyles = makeStyles(() =>
    createStyles({
        drawer: {
            width: drawerWidth,
            position: "relative",
            height: "100%",
            zIndex: 0,
        },
        drawerPaper: {
            width: drawerWidth,
            zIndex: 0,
            position: "relative",
            boxSizing: "border-box",
            borderRight: `2px solid ${primaryColor}`,
        },
        drawerContainer: {
            overflow: "auto",
            padding: "1em",
        },
    })
);

interface DrawerProps {
    isOpen: boolean;
}

export function ClippedDrawer(props: DrawerProps): JSX.Element {
    const classes = useStyles();

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
                <FilterSettings />
                <Divider variant="middle" css={deviderStyle} />
                <GraphSettings />
            </div>
        </Drawer>
    );
}
