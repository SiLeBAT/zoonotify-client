/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import React from "react";
import clsx from "clsx";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import IconButton from "@material-ui/core/IconButton";
import { useTranslation } from "react-i18next";
import { ClippedDrawer as DrawerMenu } from "./Drawer-Layout.component";
import { FilterPageContentComponent as TextContent } from "./FilterPage-Content.component";
import { DataPageComponent as DataContent } from "./DataPage.component";
import { DBentry, DBtype } from "../../../Shared/Isolat.model";
import {
    primaryColor,
    onPrimaryColor,
    bfrLightblue,
} from "../../../Shared/Style/Style-MainTheme.component";

const drawerWidth = 433;

const mainStyle = css`
    height: 100%;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
`;
const drawerStyle = css`
    flex: 0 0 auto;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
`;
const drawerClosedBarStyle = css`
    width: 35px;
    box-sizing: border-box;
    background: ${primaryColor};
`;
const drawerOpenBarStyle = css`
    display: none;
`;
const drawerTextStyle = css`
    margin: auto;
    margin-top: 50px;
    font-weight: bold;
    font-size: 20px;
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

const contentStyle = css`
    width: 0;
    min-width: 500px;
    padding: 2em;
    flex: 1 1 0;
    hyphens: auto;
    height: inherit;
    box-sizing: border-box;
`;
interface FilterPageProps {
    data: DBentry[];
    keyValues: DBtype[];
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        content: {
            flexGrow: 1,
            padding: 0,
            transition: theme.transitions.create("margin", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: -drawerWidth,
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

export function FilterPageLayoutComponent(props: FilterPageProps): JSX.Element {
    const [open, setOpen] = React.useState(true);
    const classes = useStyles();
    const { t } = useTranslation(["FilterPage"]);

    const handleDrawer = (): void => {
        if (open) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    };

    return (
        <main css={mainStyle}>
            <DrawerMenu isOpen={open} />
            <div
                className={clsx(classes.content, {
                    [classes.contentShift]: open,
                })}
                css={drawerStyle}
            >
                <div css={open ? drawerOpenBarStyle : drawerClosedBarStyle}>
                    <p css={drawerTextStyle}>{t("Drawer.Title")}</p>
                </div>
                <IconButton css={iconButtonStyle} onClick={handleDrawer}>
                    {open ? (
                        <ChevronLeftIcon css={drawerIconStyle} />
                    ) : (
                        <ChevronRightIcon css={drawerIconStyle} />
                    )}
                </IconButton>
            </div>

            <div css={contentStyle}>
                <div>
                    <TextContent />
                </div>
                <DataContent data={props.data} keyValues={props.keyValues} />
            </div>
        </main>
    );
}
