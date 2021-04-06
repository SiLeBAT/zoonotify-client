/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { useCallback } from "react";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import {
    primaryColor,
    secondaryColor,
} from "../../../../../Shared/Style/Style-MainTheme.component";

const resizeBarStyle = css`
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    cursor: ew-resize;
    border-right: solid ${primaryColor};
    background-color: ${secondaryColor};
    &:focus {
        outline: 0;
    }
`;
const iconButtonStyle = css`
    width: 17px;
    color: ${primaryColor};
`;

export interface ResizeBarProps {
    onResizeBarMove: (newWidth: number) => void;
}

/**
 * @desc Handles the resize of the Drawer and return the resize bar
 * @param props - props with onChange-function for changing the size of the Drawer
 * @returns {JSX.Element} - resize bar component
 */
export function DrawerControlResizeBarComponent(
    props: ResizeBarProps
): JSX.Element {
    const minDrawerWidth = 325;

    const handleMoveResizeBar = (newWidth: number): void => props.onResizeBarMove(newWidth);

    const handleMouseMove = useCallback((e): void => {
        const newWidth = e.clientX - document.body.offsetLeft;
        if (newWidth > minDrawerWidth) {
            handleMoveResizeBar(newWidth);
        }
    }, []);

    const handleMouseUp = (): void => {
        document.removeEventListener("mouseup", handleMouseUp, true);
        document.removeEventListener("mousemove", handleMouseMove, true);
    };

    const handleMouseDown = (): void => {
        document.addEventListener("mouseup", handleMouseUp, true);
        document.addEventListener("mousemove", handleMouseMove, true);
    };

    return (
        <div
            role="button"
            tabIndex={0}
            css={resizeBarStyle}
            onMouseDown={handleMouseDown}
        >
            <DragIndicatorIcon fontSize="small" css={iconButtonStyle} />
        </div>
    );
}
