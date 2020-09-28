/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useState, useContext, useEffect } from "react";
import clsx from "clsx";
import _ from "lodash";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import { Divider } from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import IconButton from "@material-ui/core/IconButton";
import { useTranslation } from "react-i18next";
import { ClippedDrawer as DrawerMenu } from "./Drawer/Drawer-Layout.component";
import { QueryPageTextContentComponent as TextContent } from "./QueryPage-TextContent.component";
import { QueryPageParameterContentComponent as ParameterContent } from "./Parameter/QueryPage-ParameterContent.component";
/* import { QueryPageTableComponent as DataContent } from "./QueryPage-IsolatesTable.component"; */
import {
    primaryColor,
    onPrimaryColor,
    bfrLightblue,
} from "../../../Shared/Style/Style-MainTheme.component";
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { FilterType, mainFilterAttributes } from "../../../Shared/Filter.model";
import { TableContext } from "../../../Shared/Context/TableContext";
import { QueryPageTableRestultComponent } from "./Results/QueryPage-ResultData.component";
import { DataContext } from "../../../Shared/Context/DataContext";
import { DBentry } from "../../../Shared/Isolat.model";

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

export function QueryPageComponent(): JSX.Element {
    const [open, setOpen] = useState(true);
    const [isFilter, setIsFilter] = useState(false);
    const [isTable, setIsTable] = useState(false);
    const { filter } = useContext(FilterContext);
    const { table, setTable } = useContext(TableContext);
    const { data, setData } = useContext(DataContext);
    const classes = useStyles();
    const { t } = useTranslation(["QueryPage"]);

    let filterData: DBentry[] = [];

    // TODO: Dieser FilterAlgo und Reults-CountIsolates müssen zusammen gehören. 
    // Ohne FilterAlgo funktioniert nur die Darstellung bei ausgewählten rows/columns
    // summieren der Reults-CountIsolates werte, um "alle isolate" darzustellen? 
    // also ganz ohne FilterAlgo

    const useFilter = (): void => {
        let filteredData: DBentry[] = data.ZNData;
        mainFilterAttributes.map(async (attribute: FilterType) => {
            if (!_.isEmpty(filter[attribute])) {
                let tempFilteredData: DBentry[] = [];
                filter[attribute].forEach((element) => {
                    tempFilteredData = tempFilteredData.concat(
                        _.filter(filteredData, {
                            [attribute]: element,
                        })
                    );
                });
                filteredData = tempFilteredData;
            }
        });
        setData({ ...data, ZNDataFiltered: filteredData });
        setTable({
            ...table,
            statisticData: [
                {
                    "Number of isolates": String(
                        Object.keys(filteredData).length
                    ),
                },
            ],
        });
    };

    const noFilter = mainFilterAttributes.every(function emptyArray(
        key
    ): boolean {
        const empty: boolean = _.isEmpty(filter[key]);
        return empty;
    });

    const handleDrawer = (): void => {
        if (open) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    };

    // TODO: funktioniert soweit, aber wenn man die Componente neu lädt wird zuerst die tabelle geladen und danach erst die nummer der isolate gesetzt

    // TODO: auch alle anderen Zahlen sind einen Click verzögert

    // TODO: weiterhin der BUG: dass wenn man martix filtert und nur Erreger, sich die zahl nicht verringert

    useEffect((): void => {
        // eslint-disable-next-line no-console
        console.log("component did mount");
        // eslint-disable-next-line no-console
        console.log(noFilter);
        if (noFilter) {
            filterData = data.ZNData;
            setData({ ...data, ZNDataFiltered: data.ZNData });
            /*             setIsolates(Object.keys(filterData).length);
             */ setTable({
                ...table,
                statisticData: [
                    {
                        "Number of isolates": String(
                            Object.keys(filterData).length
                        ),
                    },
                ],
            });
        }
    }, []);

    useEffect((): void => {
        mainFilterAttributes.forEach((element): void => {
            if (filter[element].length !== 0) {
                setIsFilter(true);
            }
        });
        if (table.row.length !== 0 || table.column.length !== 0) {
            setIsTable(true);
        } else {
            setIsTable(false);
        }
    }, [filter, table]);

        useEffect((): void => {
        if (!noFilter) {
            useFilter();
        }
    }, [filter]);

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
                    {isFilter || isTable ? (
                        <ParameterContent />
                    ) : (
                        <div>
                            <TextContent />
                        </div>
                    )}
                    <Divider variant="middle" css={deviderStyle} />
                    <h3 css={subHeadingTextStyle}>{t("Results.Title")}</h3>
                    {/* Hier werden die tabellen dargestellt */}
                    <QueryPageTableRestultComponent />

                    {/*                     {isTable ? (
                        <QueryPageTableRestultComponent />
                    ) : (
                        <DataContent />
                    )} */}
                </div>
            </div>
        </main>
    );
}
