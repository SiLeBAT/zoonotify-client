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
import { FilterType } from "../../../../Shared/Filter.model";

const spaceStyle = css`
    padding: 0;
    margin: 0;
`;
const listStyle = css`
    padding: 0;
    margin: 0;
    width: 50%;
`;
const parameterValue = css`
    margin-top: 0;
    margin-left: 2em;
    span {
        letter-spacing: 0;
    }
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
        nested: {
            paddingLeft: 0,
            lineHeight: "20px",
            color: "black",
            fontWeight: "bold",
        },
    })
);

function AddParameterToList(parameterList: string[]): JSX.Element[] {
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

interface ParameterListProps {
    element1: FilterType;
    element2: FilterType;
    listElements1: string[];
    listElements2: string[];
}

export function ParameterListComponent(props: ParameterListProps): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation(["QueryPage"]);

    const ListElement = (
        element: FilterType,
        attributeList: string[]
    ): JSX.Element => {
        if (element !== undefined) {
            const keyName = element.replace(" ", "_");
            const label = t(`Filters.${element}`);

            return (
                <List
                    dense
                    className={classes.root}
                    key={`list-${keyName}`}
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
                    {AddParameterToList(attributeList)}
                </List>
            );
        }
        return <p css={listStyle}>&nbsp;</p>;
    };

    return (
        <div
            css={css`
                display: flex;
                flex-direction: row;
            `}
        >
            {ListElement(props.element1, props.listElements1)}
            {ListElement(props.element2, props.listElements2)}
        </div>
    );
}
