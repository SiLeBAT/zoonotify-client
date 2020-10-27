/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import {
    List,
    ListItem,
    ListItemText,
    makeStyles,
    Theme,
    createStyles,
} from "@material-ui/core";

const tableStyle = css`
    vertical-align: top;
    padding-top: 18px;
`;
const parameterLabel = css`
    margin: 0;
`;
const parameterValue = css`
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
    label: string;
    keyName: string;
    listElements: string[];
}

export function ParameterListComponent(props: ParameterListProps): JSX.Element {
    const classes = useStyles();

    return (
        <tr key={`tr-${props.keyName}`}>
            <td key={`td-heading-${props.keyName}`} css={tableStyle}>
                <h4 css={parameterLabel}>{props.label}:</h4>
            </td>
            <td key={`tr-list-${props.keyName}`}>
                <List
                    dense
                    className={classes.root}
                    key={`list-${props.keyName}`}
                >
                    {AddParameterToList(props.listElements)}
                </List>
            </td>
        </tr>
    );
}
