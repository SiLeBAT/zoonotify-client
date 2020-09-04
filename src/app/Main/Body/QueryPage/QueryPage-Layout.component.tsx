/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useState, useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import clsx from "clsx";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import { Divider } from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import IconButton from "@material-ui/core/IconButton";
import { useTranslation } from "react-i18next";
import { ClippedDrawer as DrawerMenu } from "./Drawer/Drawer-Layout.component";
import { QueryPageTextContentComponent as TextContent } from "./QueryPage-TextContent.component";
import { QueryPageParameterContentComponent as ParameterContent } from "./QueryPage-ParameterContent.component";
import { QueryPageTableComponent as DataContent } from "./QueryPage-Data.component";
import {
    primaryColor,
    onPrimaryColor,
    bfrLightblue,
} from "../../../Shared/Style/Style-MainTheme.component";
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { FilterType, FilterInterface } from "../../../Shared/Filter.model";


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
const contentBoxStyle = css`
    max-width: 50%;
    min-width: 40em;
    margin: auto;
    display: flex;
    flex: 0 1 auto;
    flex-direction: column;
    hyphens: auto;
    box-sizing: border-box;
`;
const headingStyle = css`
    font-size: 3rem;
    text-align: center;
    font-weight: normal;
    color: ${primaryColor};
`;
const deviderStyle = css`
    width: 100%;
    height: 0.15em;
    background: ${primaryColor};
    padding: 0;
    margin: 2em 0;
`;
const subHeadingTextStyle = css`
    margin-top: 2em;
`;

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

function getParams(path: string): FilterInterface {
    const searchParams = new URLSearchParams(path);
    const e = searchParams.get("Erreger") || "";
    const m = searchParams.get("Matrix") || "";
    return {
        Erreger: e.split("_"),
        Matrix: m.split("_"),
    };
}


export function QueryPageLayoutComponent(): JSX.Element {
    const history = useHistory();
    const [open, setOpen] = useState(true);
    const [isFilter, setIsFilter] = useState(false);
    const { filter, setFilter } = useContext(FilterContext);
    const classes = useStyles();
    const { t } = useTranslation(["QueryPage"]);

    const handleDrawer = (): void => {
        if (open) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    };

    /**
     * @desc check path for filter settings and define them in the context, every time the component did mount (Lifecycle methode: componentDidMount)
     */
    useEffect((): void => {
        const filterFromPath = getParams(history.location.search);
        Object.keys(filterFromPath).forEach((element) => {
            const e = element as FilterType;
            if (filterFromPath[e][0] !== "alle Werte" && filterFromPath[e][0] !== "all values") {
                setFilter(filterFromPath);
            } 
        });
    }, []);

    /**
     * @desc check if filter are set, every time the component did update (Lifecycle methode: componentDidUpdate)
     */
    useEffect((): void => {
        Object.keys(filter).forEach((element): void => {
            const e = element as FilterType;
            if (filter[e].length !== 0) {
                setIsFilter(true);
            }
        });
    });

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
                <h1 css={headingStyle}>{t("Content.Title")}</h1>
                <div css={contentBoxStyle}>
                    {isFilter ? (
                        <ParameterContent />
                    ) : (
                        <div>
                            <TextContent />
                        </div>
                    )}
                    <Divider variant="middle" css={deviderStyle} />
                    <h3 css={subHeadingTextStyle}>{t("Results.Title")}</h3>
                    <DataContent />
                </div>
            </div>
        </main>
    );
}
