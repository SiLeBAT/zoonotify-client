import React from "react";
import { Typography } from "@mui/material";
import { formatMicroorganismNameArray, WordObject } from "./utils";

interface FormattedMicroorganismNameProps {
    microName: string | null | undefined;
}

const FormattedMicroorganismName: React.FC<FormattedMicroorganismNameProps> = ({
    microName,
}) => {
    const words = formatMicroorganismNameArray(microName);
    return (
        <Typography component="span">
            {words.map((wordObj: WordObject, index: number) => (
                <React.Fragment key={index}>
                    {wordObj.italic ? <i>{wordObj.text}</i> : wordObj.text}
                    {/* You might add a space after each word if needed */}{" "}
                </React.Fragment>
            ))}
        </Typography>
    );
};

export { FormattedMicroorganismName };
