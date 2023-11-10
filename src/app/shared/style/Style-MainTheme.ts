import { createTheme, responsiveFontSizes } from "@mui/material/styles";

/*
BfR Colours
*/

const bfrBlue = "rgb(0, 56, 105)"; // #003869
const bfrWhite = "rgb(255, 255, 255)"; // #ffffff
const bfrLightgrey = "rgb(219, 228, 235)"; //
//const bfrLightBlue = "rgb(179, 195, 210)"; //#b3c3d2
const bfrLightBlue = "rgb(186, 216, 233)"; //#b3c3d2
const bfrBlack = "rgb(0, 0, 0)"; // #000000
const bfrRed = "rgb(228, 0, 56)"; //

export const primaryColor = bfrBlue;
export const secondaryColor = bfrLightBlue;
export const backgroundColor = bfrWhite;
export const surfaceColor = bfrLightgrey;
export const errorColor = bfrRed;
export const onPrimaryColor = bfrWhite;
export const onSecondaryColor = bfrBlue;
export const onSurfaceColor = bfrBlack;
export const onErrorColor = bfrBlack;

export const headerHeight = "42px";
export const footerHeight = "42px";

/*
 * Theme generated using this tool: http://mcg.mbitson.com
 * The primary color (value 500) used was the bfr-blue.
 */

/*
 * Shadow coloring
 */

export const shadowPalette = {
    shadow1: "rgba(0, 0, 0, 0.2)",
    shadow2: "rgba(0, 0, 0, 0.14)",
    shadow3: "rgba(0, 0, 0, 0.12)",
};

// A custom theme for this app
const theme = {
    palette: {
        mode: "light",
        primary: {
            main: primaryColor,
            contrastText: onPrimaryColor,
        },
        secondary: {
            main: secondaryColor,
            contrastText: onSecondaryColor,
        },
        error: {
            main: errorColor,
            contrastText: onErrorColor,
        },
        text: {
            primary: onSurfaceColor,
        },
        background: {
            paper: surfaceColor,
            default: backgroundColor,
        },
        divider: primaryColor,
    },
    typography: {
        lineHeight: "1.6",
        h1: {
            fontSize: "2rem",
        },
        h2: {
            fontSize: "1.7em",
        },
        h3: {
            fontSize: "1.5em",
        },
        h5: {
            fontSize: "1.1em",
        },
    },
} as const;

declare module "@mui/material/styles" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface TypographyVariants {}

    // allow configuration using `createTheme`
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface TypographyVariantsOptions {}
}

// Update the Typography's variant prop options
declare module "@mui/material/Typography" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface TypographyPropsVariantOverrides {}
}
// eslint-disable-next-line import/no-default-export
export const znTheme = responsiveFontSizes(createTheme(theme));
