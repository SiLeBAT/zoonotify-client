import { FormControl, Tab, Tabs } from "@mui/material";
import Box from "@mui/material/Box";
import React, { useEffect, useState } from "react";
import * as jsonld from "jsonld";
import { ErrorSnackbar } from "../../shared/components/ErrorSnackbar/ErrorSnackbar";

type JSONViewerProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetch: (viewName: string) => any;
    view: string;
};

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    data: string;
}

function CustomTabPanel(props: TabPanelProps): JSX.Element {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
            style={{ height: "100%" }}
        >
            {value === index && (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        height: "95%",
                    }}
                >
                    <FormControl sx={{ flex: "1 1 0" }}>
                        <textarea
                            style={{ height: "-webkit-fill-available" }}
                            id="jsondata"
                            placeholder="Result will appear here!"
                            name="inputJSON"
                            value={other.data}
                            readOnly
                        />
                    </FormControl>
                </Box>
            )}
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function a11yProps(index: number): any {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
}

export function JSONViewer({
    data,
    fetch,
    view,
}: JSONViewerProps): JSX.Element {
    const [formattedData, setFormattedData] = useState("");
    const [error, setError] = useState<string | null>(null);
    const beautifyJSON = (): void => {
        if (data && data.length > 0) {
            const formatData = JSON.stringify(data, null, 2);
            setFormattedData(formatData);
        }
    };

    const toRDF = async (): Promise<boolean> => {
        try {
            if (data && data.length > 0) {
                const nquads = await jsonld.toRDF(data, {
                    format: "application/n-quads",
                });
                const formatData = JSON.stringify(nquads, null, 2);
                setFormattedData(formatData);
                return true;
            }
            return false;
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred."
            );
            return false;
        }
    };

    const [value, setValue] = React.useState(0);

    useEffect(() => {
        switch (view) {
            case "LD":
                beautifyJSON();
                break;
            case "RDF":
                toRDF();
                break;
            case "JSON":
                beautifyJSON();
                break;
            default:
                beautifyJSON();
                break;
        }
    }, [data, view]);

    useEffect(() => {
        switch (view) {
            case "LD":
                setValue(0);
                break;
            case "RDF":
                setValue(1);
                break;
            case "JSON":
                setValue(2);
                break;
            default:
                break;
        }
    }, [view]);

    const handleChange = (
        _event: React.SyntheticEvent,
        newValue: number
    ): void => {
        if (newValue == 0) {
            fetch("LD");
            beautifyJSON();
        }
        if (newValue == 1) {
            fetch("RDF");
            toRDF();
        }
        if (newValue == 2) {
            fetch("JSON");
        }
        setValue(newValue);
    };

    const handleCloseError = (): void => {
        setError(null);
    };

    return (
        <>
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                }}
            >
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        aria-label="basic tabs example"
                        style={{
                            height: "95%",
                        }}
                    >
                        <Tab label="LD" {...a11yProps(0)} />
                        <Tab label="RDF" {...a11yProps(1)} />
                        <Tab label="JSON" {...a11yProps(2)} />
                    </Tabs>
                </Box>
                <div
                    style={{
                        height: "95%",
                    }}
                >
                    <CustomTabPanel
                        value={value}
                        index={0}
                        data={formattedData}
                    />
                    <CustomTabPanel
                        value={value}
                        index={1}
                        data={formattedData}
                    />
                    <CustomTabPanel
                        value={value}
                        index={2}
                        data={formattedData}
                    />
                </div>
            </Box>
            {error && (
                <ErrorSnackbar open={!!error} handleClose={handleCloseError} />
            )}
        </>
    );
}
