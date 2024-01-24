import React, { useEffect, useRef, useState } from "react";
import { Box, Paper, styled } from "@mui/material";
import { footerHeight, headerHeight } from "../../shared/style/Style-MainTheme";
import {
    DivisionToken,
    FilterSelection,
    SelectionFilterConfig,
} from "../model/Evaluations.model";

interface Model {
    loading: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    evaluationsData: Record<DivisionToken, any>;
    selectionConfig: SelectionFilterConfig[];
    selectedFilters: FilterSelection;
    downloadGraphButtonText: string;
    downloadDataButtonText: string;
}

interface Operations {
    showDivision: (div: string) => boolean;
    fetchData: (filter: FilterSelection) => void;
    updateFilters: (newFilters: FilterSelection) => void;
}

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
}));

interface MainContentComponentProps {
    model: Model;
    operations: Operations;
    children?: (() => React.ReactNode) | null;
}

export const MainContentComponent: React.FC<MainContentComponentProps> = ({
    model,
    children,
}): JSX.Element => {
    const headerRef = useRef<HTMLDivElement>(null);
    const [heightFromTop, setHeightFromTop] = useState<number>(230);

    useEffect(() => {
        const updateHeightFromTop = (): void => {
            if (headerRef.current) {
                const newHeight =
                    headerRef.current.clientHeight +
                    Number(footerHeight) +
                    Number(headerHeight) +
                    18;
                if (newHeight !== heightFromTop) {
                    setHeightFromTop(newHeight);
                }
            }
        };

        updateHeightFromTop();

        window.addEventListener("resize", updateHeightFromTop);
        return () => window.removeEventListener("resize", updateHeightFromTop);
    }, [model.selectionConfig]);

    return (
        <Item sx={{ width: "100%", boxShadow: "15px 0 15px -15px inset" }}>
            <Box ref={headerRef}>{children && children()}</Box>
        </Item>
    );
};
