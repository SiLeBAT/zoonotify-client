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
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { FilterType } from "../../../../Shared/Model/Filter.model";
import { getMicroorganismLabelService } from "../Services/getMicroorganismLabel";

const spaceStyle = css`
    padding: 0;
    margin: 0;
`;
const listStyle = css`
    padding: 0;
    margin: 0 4em 0 0;
`;
const listHeaderStyle = css`
    position: relative;
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
            width: "11em",
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

/**
 * @desc Create a ListItem for each parameter
 * @param parameterList - list of selected parameter (filter)
 * @returns {JSX.Element[]} - list of ListItem-components
 */
function createListItemComponent(
    parameterAttribute: FilterType,
    parameterList: string[],
    t: TFunction
): JSX.Element[] {
    const elements: JSX.Element[] = [];
    parameterList.forEach((parameter): void => {
        const key = parameter.replace(".", "");
        let parameterName: string | JSX.Element = "";
        if (parameterAttribute === "microorganism") {
            const translateRootString = `FilterValues.formattedMicroorganisms.${key}`
            const prefix = t(`${translateRootString}.prefix`)
            const name = t(`${translateRootString}.name`)
            const italicName = t(`${translateRootString}.italicName`)
            const suffix = t(`${translateRootString}.suffix`)
            parameterName = getMicroorganismLabelService({prefix,
            name,
            italicName,
            suffix}
            );
        } else {
            parameterName = t(`FilterValues.${parameterAttribute}.${key}`);
        }

        const keyName = parameter.replace(" ", "_");
        elements.push(
            <ListItem key={`listItem-${keyName}`} css={spaceStyle}>
                <ListItemText
                    id={`labelId-${keyName}`}
                    primary={parameterName}
                    css={parameterValue}
                />
            </ListItem>
        );
    });
    return elements;
}

export interface ListProps {
    parameterLabel: FilterType;
    parameterList: string[];
}

export function ParameterContentListComponent(props: ListProps): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation(["QueryPage"]);
    const label = t(`Filters.${props.parameterLabel}`);

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
                    css={listHeaderStyle}
                >
                    {label}
                </ListSubheader>
            }
        >
            {createListItemComponent(
                props.parameterLabel,
                props.parameterList,
                t
            )}
        </List>
    );
}
