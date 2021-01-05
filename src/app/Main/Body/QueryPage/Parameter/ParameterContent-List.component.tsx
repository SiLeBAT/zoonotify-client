/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import {
    List,
    ListItem,
    ListItemText,
    makeStyles,
    Theme,
    createStyles,
    ListSubheader,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { FilterType } from "../../../../Shared/Model/Filter.model";

const spaceStyle = css`
    padding: 0;
    margin: 0;
`;
const listStyle = css`
    padding: 0;
    margin: 0 4em 0 0;
`;
const parameterValue = css`
    margin-top: 0;
    margin-left: 2em;
    white-space: nowrap;
    span {
        letter-spacing: 0;
    }
`;
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            maxWidth: 752,
            flex: "1 1 auto",
        },
        demo: {
            backgroundColor: theme.palette.background.paper,
        },
        nested: {
            paddingLeft: 0,
            lineHeight: "20px",
            color: "black",
            fontWeight: "bold",
        },
    })
);

function createListItemComponent(parameterList: string[]): JSX.Element[] {
    const elements: JSX.Element[] = [];
    parameterList.forEach((element): void => {
        const keyName = element.replace(" ", "_");
        elements.push(
            <ListItem key={`listItem-${keyName}`} css={spaceStyle}>
                <ListItemText
                    id={`labelId-${keyName}`}
                    primary={element}
                    css={parameterValue}
                />
            </ListItem>
        );
    });
    return elements;
}

interface ListProps {
    element: FilterType;
    listElements: string[];
}

export function ParameterContentListComponent(props: ListProps): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation(["QueryPage"]);
    const label = t(`Filters.${props.element}`);

    return (
        <List
            dense
            className={classes.root}
            css={listStyle}
            subheader={
                <ListSubheader
                    component="div"
                    id="nested-list-subheader"
                    className={classes.nested}
                >
                    {label}
                </ListSubheader>
            }
        >
            {createListItemComponent(props.listElements)}
        </List>
    );
}
