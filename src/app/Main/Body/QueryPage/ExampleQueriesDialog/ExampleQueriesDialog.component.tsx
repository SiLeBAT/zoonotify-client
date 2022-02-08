import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@mui/material";
import {
    DialogButton,
    DialogComponent,
} from "../../../../Shared/Dialog.component";
import { AccordionComponent } from "../../../../Shared/Accordion.component";
import { exampleQueriesLists, QueryCategory } from "./ExampleQueries.constants";

function QueryAccordion(
    exampleQuery: string,
    title: JSX.Element,
    key: string,
    contentText: JSX.Element,
    buttonText: string,
    onClickExampleQuery: (exampleQuery: string) => void,
    isLoading: boolean
): JSX.Element {
    const handleSubmitQuery = (): void => onClickExampleQuery(exampleQuery);
    const accordionTitle = title;
    const queryContent = (
        <div>
            <p>{contentText}</p>
            <Button
                onClick={handleSubmitQuery}
                color="primary"
                disabled={isLoading}
                variant="contained"
            >
                {buttonText}
            </Button>
        </div>
    );

    return (
        <AccordionComponent
            title={accordionTitle}
            content={queryContent}
            defaultExpanded={false}
            centerContent
            key={`accordion_query_${key}`}
        />
    );
}

export function ExampleQueriesDialogComponent(props: {
    loading: boolean;
    onClickClose: () => void;
    onClickExampleQuery: (exampleQuery: string) => void;
}): JSX.Element {
    const { t } = useTranslation(["ExampleQueries"]);
    const handleClose = (): void => props.onClickClose();

    const dialogTitle = t("Content.Title");
    const contentText = t("Content.Text");
    const cancelButton: DialogButton = {
        content: t(`Button.Cancel`),
        onClick: handleClose,
    };

    const dialogContent: JSX.Element[] = [];

    const categories: QueryCategory[] = [
        "feedSample",
        "animalSample",
        "foodSample",
    ];

    categories.forEach((category) => {
        dialogContent.push(
            <p key={`query_${category}`}>{t(`Subtitles.${category}`)}</p>
        );
        exampleQueriesLists[category].forEach((exampleQuery, index) => {
            const sampleTitle: JSX.Element = (
                <span>
                    <i>{t(`Queries.${category}.Query${index}.Title.Part1`)}</i>
                    {t(`Queries.${category}.Query${index}.Title.Part2`)}
                </span>
            );

            const sampleKey =
                t(`Queries.${category}.Query${index}.Title.Part1`) +
                t(`Queries.${category}.Query${index}.Title.Part2`);

            const sampleText: JSX.Element = (
                <span>
                    {t(`Queries.${category}.Query${index}.Text.Part1`)}
                    <i>{t(`Queries.${category}.Query${index}.Text.Part2`)}</i>
                    {t(`Queries.${category}.Query${index}.Text.Part3`)}
                </span>
            );
            dialogContent.push(
                QueryAccordion(
                    exampleQuery,
                    sampleTitle,
                    sampleKey,
                    sampleText,
                    t(`Button.Submit`),
                    props.onClickExampleQuery,
                    props.loading
                )
            );
        });
    });

    return DialogComponent({
        loading: props.loading,
        dialogTitle,
        dialogContentText: contentText,
        dialogContent: <div>{dialogContent}</div>,
        cancelButton,
    });
}
