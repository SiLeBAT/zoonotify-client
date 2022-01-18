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
    title: string,
    contentText: string,
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
            key={`accordion_query_${title}`}
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
        "animalSample",
        "foodSample",
        "feedSample",
    ];

    categories.forEach((category) => {
        dialogContent.push(<p>{t(`Subtitles.${category}`)}</p>);
        exampleQueriesLists[category].forEach((exampleQuery, index) => {
            dialogContent.push(
                QueryAccordion(
                    exampleQuery,
                    t(`Queries.${category}.Query${index}.Title`),
                    t(`Queries.${category}.Query${index}.Text`),
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
