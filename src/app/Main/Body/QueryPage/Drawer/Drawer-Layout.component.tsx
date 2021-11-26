/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Box } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import { primaryColor } from "../../../../Shared/Style/Style-MainTheme";

const filterHeadingStyle = css`
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    font-weight: bold;
    font-size: 1.5rem;
    line-height: 2rem;
    color: ${primaryColor};
`;

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
    const drawerWidthSting = props.drawerWidth as unknown as string;

    return (
        <Drawer
            sx={{
                width: `${drawerWidthSting}px`,
                minWidth: "325px",
                position: "relative",
                height: "100%",
                zIndex: 0,
                [`& .MuiDrawer-paper`]: {
                    position: "relative",
                    boxSizing: "border-box",
                    width: "inherit",
                    zIndex: 0,
                    direction: "rtl",
                    overflow: "auto",
                },
            }}
            variant="persistent"
            anchor="left"
            open={props.isOpen}
        >
            <Box
                sx={{
                    direction: "ltr",
                    padding: "1em",
                    height: "100%",
                }}
            >
                <p css={filterHeadingStyle}>{props.drawerTitle}</p>
                {props.filterSelection}
                {props.displayFeatureSelection}
            </Box>
        </Drawer>
    );
}
