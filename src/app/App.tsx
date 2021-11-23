import React, { Suspense } from "react";
import * as ReactDOM from "react-dom";
import { ThemeProvider, Theme, StyledEngineProvider, createTheme } from '@mui/material/styles';
import StylesProvider from '@mui/styles/StylesProvider';
import "../i18n";
import { FilterProvider } from "./Shared/Context/FilterContext";
import { DataProvider } from "./Shared/Context/DataContext";
import { LoadingProcessComponent } from "./Shared/LoadingProcess.component";
import { MainLayoutComponent } from "./Main/Main-Layout.component";



declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


const theme = createTheme();

ReactDOM.render(
    <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
        <Suspense fallback={<LoadingProcessComponent />}>
            <FilterProvider>
                    <DataProvider>
                        <StylesProvider injectFirst>
                            <MainLayoutComponent />
                        </StylesProvider>
                    </DataProvider>
            </FilterProvider>
        </Suspense>
        </ThemeProvider>
    </StyledEngineProvider>,
    document.querySelector("#application")
);
