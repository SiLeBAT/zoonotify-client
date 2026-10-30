import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { LinkFinderSearch } from "../LinkFinderSearch.component";
import {
    DataIndex,
    FoundLink,
    LinkFinder,
    LinkFinderResult,
    LinkFinderUnavailableError,
} from "../..";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, options?: { [k: string]: unknown }) =>
            options ? `${key} ${JSON.stringify(options)}` : key,
        i18n: { language: "en" },
    }),
}));

const index: DataIndex = { newestYear: () => Promise.resolve(2024) };

const EXACT: FoundLink = {
    page: "prevalence",
    filters: { microorganism: ["Salmonella spp."], matrix: ["Fresh meat"] },
    url: "/prevalence?microorganism=Salmonella+spp.&matrix=Fresh+meat&lang=en",
    labels: [
        { dim: "microorganism", text: "Salmonella spp." },
        { dim: "matrix", text: "Fresh meat" },
    ],
    dropped: [],
};

function fakeFinder(answer: () => Promise<LinkFinderResult>): {
    finder: LinkFinder;
    find: jest.Mock;
} {
    const find = jest.fn(answer);
    return { finder: { find }, find };
}

function renderSearch(finder: LinkFinder): void {
    render(
        <MemoryRouter>
            <LinkFinderSearch finder={finder} index={index} />
        </MemoryRouter>
    );
}

async function search(text: string): Promise<void> {
    const input = screen.getByRole("searchbox", { name: "SearchLabel" });
    await userEvent.type(input, `${text}{Enter}`);
}

describe("LinkFinderSearch", () => {
    it("searches with the keyboard and shows each link with its filter labels", async () => {
        const { finder, find } = fakeFinder(() =>
            Promise.resolve({ links: [EXACT], unmatched: [] })
        );
        renderSearch(finder);

        await search("Salmonella in meat");

        const link = await screen.findByRole("link", { name: /Prevalence/ });
        expect(link).toHaveAttribute("href", EXACT.url);
        expect(within(link).getByText("Salmonella spp.")).toBeInTheDocument();
        expect(within(link).getByText("Fresh meat")).toBeInTheDocument();
        expect(find).toHaveBeenCalledWith("Salmonella in meat", "en", index);
    });

    it("names the unmatched words", async () => {
        const { finder } = fakeFinder(() =>
            Promise.resolve({ links: [EXACT], unmatched: ["blorp", "zork"] })
        );
        renderSearch(finder);

        await search("Salmonella blorp zork");

        expect(
            await screen.findByText('Unmatched {"words":"blorp, zork"}')
        ).toBeInTheDocument();
    });

    it("says so when nothing was found and points to the side panel", async () => {
        const { finder } = fakeFinder(() =>
            Promise.resolve({ links: [], unmatched: ["blorp"] })
        );
        renderSearch(finder);

        await search("blorp");

        expect(await screen.findByText("NoLinks")).toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("says plainly when no resistance data exists for the search's filters", async () => {
        const { finder } = fakeFinder(() =>
            Promise.resolve({
                links: [],
                unmatched: [],
                noResistanceData: true,
            })
        );
        renderSearch(finder);

        await search("resistance in berries");

        expect(await screen.findByText("NoResistanceData")).toBeInTheDocument();
        expect(screen.queryByText("NoLinks")).not.toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("marks a closest link", async () => {
        const { finder } = fakeFinder(() =>
            Promise.resolve({
                links: [{ ...EXACT, closest: true }],
                unmatched: [],
            })
        );
        renderSearch(finder);

        await search("Salmonella in meat 2009");

        const link = await screen.findByRole("link", { name: /Prevalence/ });
        expect(within(link).getByText("Closest")).toBeInTheDocument();
    });

    it("says on a closest link which filters it dropped", async () => {
        const { finder } = fakeFinder(() =>
            Promise.resolve({
                links: [
                    {
                        ...EXACT,
                        closest: true,
                        dropped: [
                            { dim: "sampleOrigin", text: "Cattle" },
                            { dim: "samplingYear", text: "2009" },
                        ],
                    },
                ],
                unmatched: [],
            })
        );
        renderSearch(finder);

        await search("Salmonella in cattle meat 2009");

        const link = await screen.findByRole("link", { name: /Prevalence/ });
        expect(
            within(link).getByText('Without {"values":"Cattle, 2009"}')
        ).toBeInTheDocument();
    });

    it("shows no dropped-filter note on an exact link", async () => {
        const { finder } = fakeFinder(() =>
            Promise.resolve({ links: [EXACT], unmatched: [] })
        );
        renderSearch(finder);

        await search("Salmonella in meat");

        const link = await screen.findByRole("link", { name: /Prevalence/ });
        expect(within(link).queryByText(/Without/)).not.toBeInTheDocument();
    });

    it("titles AMR links by their graph", async () => {
        const amr: FoundLink = {
            page: "amr",
            view: "substance",
            filters: { microorganism: ["Campylobacter spp."] },
            url: "/antibiotic-resistance?s=abc&lang=en",
            labels: [{ dim: "microorganism", text: "Campylobacter spp." }],
            dropped: [],
        };
        const { finder } = fakeFinder(() =>
            Promise.resolve({
                links: [amr, { ...amr, view: "trend", url: "/t" }],
                unmatched: [],
            })
        );
        renderSearch(finder);

        await search("cipro resistance campylobacter");

        expect(
            await screen.findByRole("link", { name: /PageAmrSubstance/ })
        ).toHaveAttribute("href", amr.url);
        expect(
            screen.getByRole("link", { name: /PageAmrTrend/ })
        ).toHaveAttribute("href", "/t");
        expect(
            screen.queryByRole("link", { name: /PagePrevalence/ })
        ).not.toBeInTheDocument();
    });

    it("says the search is unavailable when the word list cannot be loaded", async () => {
        const { finder } = fakeFinder(() =>
            Promise.reject(new LinkFinderUnavailableError("CMS down"))
        );
        renderSearch(finder);

        await search("Salmonella");

        expect(await screen.findByText("Unavailable")).toBeInTheDocument();
    });

    it("announces results through a live region and keeps the text out of the page URL", async () => {
        const { finder } = fakeFinder(() =>
            Promise.resolve({ links: [EXACT], unmatched: [] })
        );
        renderSearch(finder);
        const before = window.location.href;

        await search("quixotrumbel Salmonella");

        const status = screen.getByRole("status");
        expect(
            await within(status).findByText('Found {"count":1}')
        ).toBeInTheDocument();
        expect(window.location.href).toBe(before);
        expect(window.location.href).not.toContain("quixotrumbel");
    });

    it("offers organism choices as buttons and re-runs the same search with the one chosen", async () => {
        const amr: FoundLink = {
            page: "amr",
            view: "trend",
            filters: {
                microorganism: ["Campylobacter spp."],
                superCategorySampleOrigin: ["Chicken"],
            },
            url: "/antibiotic-resistance?microorganism=Campylobacter+spp.&view=trend&lang=en",
            labels: [{ dim: "microorganism", text: "Campylobacter spp." }],
            dropped: [],
        };
        const { finder, find } = fakeFinder(() =>
            Promise.resolve({
                links: [],
                unmatched: [],
                chooseOrganism: [
                    { organism: "E. coli", label: "E. coli" },
                    {
                        organism: "Campylobacter spp.",
                        label: "Campylobacter spp.",
                    },
                ],
            })
        );
        renderSearch(finder);

        await search("resistance in chickens");

        const group = await screen.findByRole("group", {
            name: "ChooseOrganism",
        });
        expect(within(group).getAllByRole("button")).toHaveLength(2);
        expect(screen.queryByText("NoLinks")).not.toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();

        find.mockImplementationOnce(() =>
            Promise.resolve({ links: [amr], unmatched: [] })
        );
        await userEvent.click(
            within(group).getByRole("button", { name: "Campylobacter spp." })
        );

        expect(find).toHaveBeenLastCalledWith(
            "resistance in chickens",
            "en",
            index,
            "Campylobacter spp."
        );
        expect(
            await screen.findByRole("link", { name: /PageAmrTrend/ })
        ).toHaveAttribute("href", amr.url);
    });
});
