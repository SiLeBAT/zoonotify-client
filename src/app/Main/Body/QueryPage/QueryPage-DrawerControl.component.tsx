/** @jsx jsx */
import { css, jsx, SerializedStyles } from "@emotion/core";
import clsx from "clsx";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { useTranslation } from "react-i18next";
import { ResizeBarComponent as ResizeBar } from "./Drawer/Drawer-Resize.component";
import {
    primaryColor,
    onPrimaryColor,
    bfrLightblue,
} from "../../../Shared/Style/Style-MainTheme.component";

const drawerStyle = css`
    flex: 0 0 auto;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
`;
const drawerBarStyle = (open: boolean): SerializedStyles => css`
    display: ${open ? "none" : "flex"};
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

interface DrawerControlProps {
    isOpen: boolean;
    newWidth: number;
    handleDrawer: () => void;
    handleResize: (newWidth: number) => void;
}

export function DrawerControlComponent(props: DrawerControlProps): JSX.Element {
    const { t } = useTranslation(["QueryPage"]);

    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            content: {
                flexGrow: 1,
                padding: 0,
                transition: theme.transitions.create("margin", {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                marginLeft: -props.newWidth,
            },
            contentShift: {
                transition: theme.transitions.create("margin", {
                    easing: theme.transitions.easing.easeOut,
                    duration: theme.transitions.duration.enteringScreen,
                }),
                marginLeft: 0,
            },
        })
    );
    const classes = useStyles();

    return (
        <div
            className={clsx(classes.content, {
                [classes.contentShift]: props.isOpen,
            })}
            css={drawerStyle}
        >
            <div css={drawerBarStyle(props.isOpen)}>
                <p css={drawerTextStyle}>{t("Drawer.Title")}</p>
            </div>
            <div
                css={
                    props.isOpen
                        ? css`
                              display: flex;
                          `
                        : css`
                              display: none;
                          `
                }
            >
                <ResizeBar onChange={props.handleResize} />
            </div>
            <IconButton css={iconButtonStyle} onClick={props.handleDrawer}>
                {props.isOpen ? (
                    <ChevronLeftIcon css={drawerIconStyle} />
                ) : (
                    <ChevronRightIcon css={drawerIconStyle} />
                )}
            </IconButton>
        </div>
    );
}
