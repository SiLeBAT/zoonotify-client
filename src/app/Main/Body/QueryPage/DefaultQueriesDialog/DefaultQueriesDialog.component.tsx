import React from "react";
import { Button } from "@mui/material";
import { DialogComponent } from "../../../../Shared/Dialog.component";
import { AccordionComponent } from "../../../../Shared/Accordion.component";
import { defaultQueriesLists } from "./DefaultQueries.constants";

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
    const handleClose = (): void => props.onClickClose();

    const dialogTitle = "Beispielabfragen";
    const contentText =
        "Die hier angebotenen Abfragen illustrieren die vielfältigen Möglichkeiten der Auswertung der Zoonosen-Daten mit ZooNotify. In jeder Beispielabfrage sind Filtereinstellungen sowie Zeilen- und Spalteninhalte der Ergebnistabelle und Grafik ausgewählt. Die Beispielabfragen lassen sich nachträglich modifizieren und somit als Ausgangspunkt für eigene Abfragen nutzen.";

    const dialogContent: JSX.Element[] = [];

    dialogContent.push(<p>Tier</p>);
    defaultQueriesLists.animal.forEach((defaultQuery) => {
        dialogContent.push(
            QueryAccordion(
                defaultQuery,
                "Antibiotikaresistenz",
                "Zeitverlauf von Antibiotikaresistenz von Isolaten von Salmonella spp. aus Legehennen, die im Rahmen der Bekämpfungsprogrammen beim Geflügel gewonnen wurden",
                "Auswählen",
                props.onClickDefaultQuery,
                props.loading
            )
        );
    });
    dialogContent.push(<p>Lebensmittel</p>);
    defaultQueriesLists.food.forEach((defaultQuery) => {
        dialogContent.push(
            QueryAccordion(
                defaultQuery,
                "Antibiotikaresistenz",
                "Zeitverlauf von Antibiotikaresistenz von Isolaten von Salmonella spp. aus Legehennen, die im Rahmen der Bekämpfungsprogrammen beim Geflügel gewonnen wurden",
                "Auswählen",
                props.onClickDefaultQuery,
                props.loading
            )
        );
    });
    dialogContent.push(<p>Futtermittel</p>);
    defaultQueriesLists.animalFood.forEach((defaultQuery) => {
        dialogContent.push(
            QueryAccordion(
                defaultQuery,
                "Antibiotikaresistenz",
                "Zeitverlauf von Antibiotikaresistenz von Isolaten von Salmonella spp. aus Legehennen, die im Rahmen der Bekämpfungsprogrammen beim Geflügel gewonnen wurden",
                "Auswählen",
                props.onClickDefaultQuery,
                props.loading
            )
        );
    });

    const cancelButton = "Cancel";

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
