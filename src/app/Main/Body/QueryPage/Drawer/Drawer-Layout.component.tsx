/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import Drawer from "@mui/material/Drawer";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { primaryColor } from "../../../../Shared/Style/Style-MainTheme.component";

const filterHeadingStyle = css`
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    font-weight: bold;
    font-size: 1.5rem;
    line-height: 2rem;
    color: ${primaryColor};
`;

const ss = createStyles<
    string,
    {
        drawerWidth: string;
    }
>({
    drawer: ({ drawerWidth }) => ({
        width: `${drawerWidth}px`,
        minWidth: "325px",
        position: "relative",
        height: "100%",
        zIndex: 0,
    }),
    drawerPaper: {
        width: "inherit",
        zIndex: 0,
        position: "relative",
        direction: "rtl",
        overflow: "auto",
    },
    drawerContainer: {
        direction: "ltr",
        padding: "1em",
        height: "100%",
    },
});

const useStyles = makeStyles(() => ss);

/**
 * @desc Returns the Drawer
 * @param props
 * @returns {JSX.Element} - Drawer component
 */
export function DrawerLayoutComponent(props: {
    filterSelection: JSX.Element;
    displayFeatureSelection: JSX.Element;
    isOpen: boolean;
    drawerWidth: number;
    drawerTitle: string;
}): JSX.Element {
    const drawerWidthSting = (props.drawerWidth as unknown) as string;
    const classes = useStyles({
        drawerWidth: drawerWidthSting,
    });

    return (
        <Drawer
            className={classes.drawer}
            variant="persistent"
            anchor="left"
            open={props.isOpen}
            classes={{
                paper: classes.drawerPaper,
            }}
            sx={{ 
                [`& .MuiDrawer-paper`]: {
                    position: "relative",
                    boxSizing: "border-box",
                },
            }}
        >
            <div className={classes.drawerContainer}>
                <p css={filterHeadingStyle}>{props.drawerTitle}</p>
                {props.filterSelection}
                {props.displayFeatureSelection}
            </div>
        </Drawer>
    );
}
