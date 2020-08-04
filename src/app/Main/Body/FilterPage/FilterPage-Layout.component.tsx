/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { FilterPageContentComponent as TextContent } from "./FilterPage-Content.component";
import { DataPageDataContentComponent as DataContent } from "./DataPage.component";

const mainStyle = css`
    height: 100%;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
`;
const contentStyle = css`
    width: 0;
    padding: 2em;
    flex: 1 1 0;
    hyphens: auto;
    height: inherit;
    box-sizing: border-box;
`;

export function FilterPageLayoutComponent(): JSX.Element {
    return (
        <main css={mainStyle}>
            <div css={contentStyle}>
                <div>
                    <TextContent />
                </div>
                <DataContent />
            </div>
        </main>
    );
}
