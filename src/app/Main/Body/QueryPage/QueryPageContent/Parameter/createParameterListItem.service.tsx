/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { TFunction } from "i18next";
import { ListItem, ListItemText } from "@mui/material";
import { FilterType } from "../../../../../Shared/Model/Filter.model";
import { getMicroorganismLabelService } from "../../Services/getMicroorganismLabel";
import { replaceAll } from "../../../../../Core/replaceAll.service";

const spaceStyle = css`
    padding: 0;
    margin: 0;
`;
const parameterValue = css`
    margin-top: 0;
    margin-left: 2em;
    span {
        letter-spacing: 0;
    }
`;

export function createParameterListItemService(
    parameterAttribute: FilterType,
    parameterList: string[],
    t: TFunction, 
    isSubFilter: boolean,
): JSX.Element[] {
    const elements: JSX.Element[] = [];
    parameterList.forEach((parameter): void => {
        const key = parameter.replace(".", "");
        let parameterName: string | JSX.Element = "";
        if (parameterAttribute === "microorganism") {
            const translateRootString = `FilterValues.formattedMicroorganisms.${key}`;
            const prefix = t(`${translateRootString}.prefix`);
            const name = t(`${translateRootString}.name`);
            const italicName = t(`${translateRootString}.italicName`);
            const suffix = t(`${translateRootString}.suffix`);
            parameterName = getMicroorganismLabelService({
                prefix,
                name,
                italicName,
                suffix,
            });
        } else if (isSubFilter) {
            parameterName = t(`Subfilters.${parameterAttribute}.values.${replaceAll(parameter,
                ".",
                "-"
            )}`);
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