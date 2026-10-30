import React from "react";
import { CMS_API_ENDPOINT } from "../../shared/infrastructure/router/routes";
import { cmsDataIndex, cmsOfficialNames, createLinkFinder } from "..";
import { LinkFinderSearch } from "./LinkFinderSearch.component";

// One finder per session: its official names are fetched on the first search, then kept.
const finder = createLinkFinder(cmsOfficialNames(CMS_API_ENDPOINT));
const index = cmsDataIndex(CMS_API_ENDPOINT);

/** The Link Finder search box wired to the site's CMS. */
export function SiteLinkFinder(): JSX.Element {
    return <LinkFinderSearch finder={finder} index={index} />;
}
