/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { Box, IconButton } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useTranslation } from "react-i18next";
import { DrawerControlResizeBarComponent } from "./DrawerControl-ResizeBar.component";
import {
    primaryColor,
    onPrimaryColor,
    bfrLightblue,
} from "../../../../../Shared/Style/Style-MainTheme";

const drawerStyle = css`
    flex: 0 0 auto;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
`;
const resizeBarStyle = css`
    display: flex;
`;
const drawerBarStyle = css`
    display: flex;
    width: 41px;
    box-sizing: border-box;
    background: ${primaryColor};
`;
const drawerTextStyle = css`
    margin: auto;
    margin-top: 50px;
    font-size: 1.2rem;
    letter-spacing: 1px;
    writing-mode: vertical-lr;
    transform: rotate(180deg);
    color: ${onPrimaryColor};
`;
const iconButtonStyle = css`
    width: 18px;
    height: 36px;
    margin: auto;
    padding: 0;
    box-sizing: border-box;
`;
const drawerIconStyle = css`
    width: 18px;
    height: 36px;
    margin: auto;
    border-radius: 0 1em 1em 0;
    box-sizing: border-box;
    background: ${primaryColor};
    color: ${onPrimaryColor};
    &:hover {
        color: ${bfrLightblue};
        background: ${primaryColor};
    }
    &:focus {
        border-radius: 0 1em 1em 0;
    }
`;

export interface DrawerControlProps {
    /**
     * true if Drawer is open
     */
    isOpen: boolean;
    drawerWidth: number;
    onDrawerOpenCloseClick: () => void;
    onResizeBarMove: (drawerWidth: number) => void;
}

/**
 * @desc Display the control bar of the Drawer
 * @param props
 * @returns {JSX.Element} - control bar component of the Drawer
 */
export function QueryPageDrawerControlComponent(
    props: DrawerControlProps
): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const handleClickOpenCloseDrawer = (): void =>
        props.onDrawerOpenCloseClick();
    const handleMoveResizeBar = (drawerWidth: number): void =>
        props.onResizeBarMove(drawerWidth);

    const transitionStyles = props.isOpen
        ? {
              transition: "margin 225ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
              marginLeft: 0,
              padding: 0,
          }
        : {
              flexGrow: 1,
              padding: 0,
              transition: "margin 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
              marginLeft: -props.drawerWidth,
          };
    return (
        <Box sx={transitionStyles} css={drawerStyle}>
            {!props.isOpen && (
                <div css={drawerBarStyle}>
                    <p css={drawerTextStyle}>{t("Drawer.Title")}</p>
                </div>
            )}
            {props.isOpen && (
                <div css={resizeBarStyle}>
                    <DrawerControlResizeBarComponent
                        onResizeBarMove={handleMoveResizeBar}
                    />
                </div>
            )}
            <IconButton
                css={iconButtonStyle}
                onClick={handleClickOpenCloseDrawer}
                size="large"
            >
                {props.isOpen ? (
                    <ChevronLeftIcon css={drawerIconStyle} />
                ) : (
                    <ChevronRightIcon css={drawerIconStyle} />
                )}
            </IconButton>
        </Box>
    );
}
