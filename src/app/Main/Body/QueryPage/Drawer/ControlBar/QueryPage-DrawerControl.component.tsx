/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import clsx from "clsx";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { useTranslation } from "react-i18next";
import { DrawerControlResizeBarComponent } from "./DrawerControl-ResizeBar.component";
import {
    primaryColor,
    onPrimaryColor,
    bfrLightblue,
} from "../../../../../Shared/Style/Style-MainTheme.component";

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

    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            content: {
                flexGrow: 1,
                padding: 0,
                transition: theme.transitions.create("margin", {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                marginLeft: -props.drawerWidth,
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

    const handleClickOpenCloseDrawer = (): void =>
        props.onDrawerOpenCloseClick();
    const handleMoveResizeBar = (drawerWidth: number): void =>
        props.onResizeBarMove(drawerWidth);

    return (
        <div
            className={clsx(classes.content, {
                [classes.contentShift]: props.isOpen,
            })}
            css={drawerStyle}
        >
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
            >
                {props.isOpen ? (
                    <ChevronLeftIcon css={drawerIconStyle} />
                ) : (
                    <ChevronRightIcon css={drawerIconStyle} />
                )}
            </IconButton>
        </div>
    );
}
