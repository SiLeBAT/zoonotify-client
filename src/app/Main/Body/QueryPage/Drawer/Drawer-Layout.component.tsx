/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";
import { FilterSettingsComponent as FilterSettings } from "./Filter/Drawer-Filter.component";
import { DisplayedFeaturesComponent as DisplayedFeatures } from "./Displayed_Features/Drawer-DisplFeatures.component";
import { primaryColor } from "../../../../Shared/Style/Style-MainTheme.component";

const deviderStyle = css`
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

interface DrawerProps {
    isOpen: boolean;
    newWidth: number;
}

export function ClippedDrawer(props: DrawerProps): JSX.Element {
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
                <FilterSettings />
                <Divider variant="middle" css={deviderStyle} />
                <DisplayedFeatures />
            </div>
        </Drawer>
    );
}
