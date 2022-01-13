import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@mui/material";
import { DialogComponent } from "../../../../Shared/Dialog.component";
import { AccordionComponent } from "../../../../Shared/Accordion.component";
import {
    exampleQueriesLists,
    QueryCategories,
} from "./ExampleQueries.constants";

function QueryAccordion(
    defaultQuery: string,
    title: string,
    contentText: string,
    buttonText: string,
    onClickDefaultQuery: (defaultQuery: string) => Promise<void>,
    isLoading: boolean
): JSX.Element {
    const handleSubmitQuery = (): Promise<void> =>
        onClickDefaultQuery(defaultQuery);
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

export function DefaultQueriesDialogComponent(props: {
    loading: boolean;
    onClickClose: () => void;
    onClickDefaultQuery: (defaultQuery: string) => Promise<void>;
}): JSX.Element {
    const { t } = useTranslation(["ExampleQueries"]);
    const handleClose = (): void => props.onClickClose();

    const dialogTitle = t("Content.Title");
    const contentText = t("Content.Text");
    const cancelButton = t(`Button.Cancel`);

    const dialogContent: JSX.Element[] = [];

    const categories: QueryCategories[] = [
        "animalSample",
        "foodSample",
        "feedSample",
    ];

    categories.forEach((category) => {
        dialogContent.push(<p>{t(`Subtitles.${category}`)}</p>);
        exampleQueriesLists[category].forEach((defaultQuery, index) => {
            dialogContent.push(
                QueryAccordion(
                    defaultQuery,
                    t(`Queries.${category}.Query${index}.Title`),
                    t(`Queries.${category}.Query${index}.Text`),
                    t(`Button.Submit`),
                    props.onClickDefaultQuery,
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
        disableSubmitButton: false,
        onClose: handleClose,
    });
}
