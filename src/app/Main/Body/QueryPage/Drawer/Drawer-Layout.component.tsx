/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import { primaryColor } from "../../../../Shared/Style/Style-MainTheme.component";

const filterHeadingStyle = css`
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    font-weight: bold;
    font-size: 1.5rem;
    line-height: 2rem;
    color: ${primaryColor};
`;

const useStyles = makeStyles(() =>
    createStyles({
        drawer: (drawerWidth: string) => ({
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
    })
);

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
    const classes = useStyles(drawerWidthSting);

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
                <p css={filterHeadingStyle}>{props.drawerTitle}</p>
                {props.filterSelection}
                {props.displayFeatureSelection}
            </div>
        </Drawer>
    );
}
