import {
    bfrPrimaryPalette,
    primaryColor,
} from "../../../../../Shared/Style/Style-MainTheme.component";

export const fixedCellSize = 160;
export const isOnlyRowWidth = 40;
export const isOnlyRowHeight = 50;
export const isColHeight = 40;
export const fixedHeaderCellWidth = fixedCellSize + isColHeight;

export const defaultTableBorder = "1px solid lightgrey";

export const highlightedTableBorder = `1px solid ${primaryColor}`;

export const sumRowColBackgroundColor = bfrPrimaryPalette[50];
