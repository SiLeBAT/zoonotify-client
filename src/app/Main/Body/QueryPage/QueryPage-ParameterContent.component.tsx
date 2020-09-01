/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import {
    List,
    ListItem,
    ListItemText,
    makeStyles,
    Theme,
    createStyles,
} from "@material-ui/core";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { FilterContext } from "../../../Shared/Context/FilterContext";
import { FilterType } from "../../../Shared/Filter.model";

const subHeadingStyle = css`
    margin: 0;
`;
const parameterBlockStyle = css`
    margin-left: 2em;
`;
const tableStyle = css`
    vertical-align: top;
    padding-top: 18px;
`;
const parameterLabel = css`
    margin: 0;
`;
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            maxWidth: 752,
        },
        demo: {
            backgroundColor: theme.palette.background.paper,
        },
        title: {
            margin: theme.spacing(4, 0, 2),
        },
    })
);

function AddParameterToList(parameterList: string[]): JSX.Element[] {
    const elements: JSX.Element[] = [];
    parameterList.forEach((element): void => {
        const keyName = element.replace(" ", "_");
        elements.push(
            <ListItem key={`listItem-${keyName}`}>
                <ListItemText id={`labelId-${keyName}`} primary={element} />
            </ListItem>
        );
    });
    return elements;
}

export function QueryPageParameterContentComponent(): JSX.Element {
    const { filter } = useContext(FilterContext);
    const classes = useStyles();
    const { t } = useTranslation(["QueryPage"]);
    const mainFilterLabels = [
        t("Drawer.Filters.Pathogen"),
        t("Drawer.Filters.Matrix"),
    ];

    const filterKeys = Object.keys(filter);
    filterKeys.forEach((element) => {
        const e = element as FilterType;
        if (filter[e].length === 0) {
            filter[e] = [t("Drawer.Filters.All")];
        }
    });

    return (
        <div>
            <Accordion defaultExpanded>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <h3 css={subHeadingStyle}>{t("Results.Parameter")}</h3>
                </AccordionSummary>
                <AccordionDetails>
                    <table css={parameterBlockStyle}>
                        <tbody>
                            {(function AddParameterElement(): JSX.Element[] {
                                const elements: JSX.Element[] = [];
                                filterKeys.forEach((element, i): void => {
                                    const keyName = element.replace(" ", "_");
                                    const e = element as FilterType;
                                    elements.push(
                                        <tr key={`tr-${keyName}`}>
                                            <td
                                                key={`td-heading-${keyName}`}
                                                css={tableStyle}
                                            >
                                                <h4 css={parameterLabel}>
                                                    {mainFilterLabels[i]}:
                                                </h4>
                                            </td>
                                            <td key={`tr-list-${keyName}`}>
                                                <List
                                                    dense
                                                    className={classes.root}
                                                    key={`list-${keyName}`}
                                                >
                                                    {AddParameterToList(filter[e])}
                                                </List>
                                            </td>
                                        </tr>
                                    );
                                });
                                return elements;
                            })()}
                        </tbody>
                    </table>
                </AccordionDetails>
            </Accordion>
        </div>
    );
}
