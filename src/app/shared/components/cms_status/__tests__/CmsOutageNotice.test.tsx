import React from "react";
import { act, render, screen } from "@testing-library/react";
import { CmsOutageNotice } from "../CmsOutageNotice.component";
import { callApiService } from "../../../infrastructure/api/callApi.service";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

const fetchMock = jest.fn();

function respondWith(status: number): void {
    // jsdom has no fetch Response; this is the part callApiService reads.
    fetchMock.mockResolvedValueOnce({
        status,
        headers: { get: () => null },
        json: () => Promise.resolve({}),
    });
}

async function request(): Promise<void> {
    await act(async () => {
        await callApiService("https://cms.example/api/anything").catch(
            () => undefined
        );
    });
}

beforeEach(async () => {
    global.fetch = fetchMock;
    fetchMock.mockReset();
    // Every test starts from a CMS that answered normally.
    respondWith(200);
    await request();
});

describe("CmsOutageNotice", () => {
    it("warns the user when the CMS cannot be reached at all", async () => {
        render(<CmsOutageNotice />);
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();

        fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
        await request();

        expect(screen.getByRole("alert")).toHaveTextContent("CmsUnavailable");
    });

    it.each([502, 503, 504])(
        "warns the user when the proxy answers %i because the CMS is down",
        async (status) => {
            render(<CmsOutageNotice />);

            respondWith(status);
            await request();

            expect(screen.getByRole("alert")).toHaveTextContent(
                "CmsUnavailable"
            );
        }
    );

    it("clears the warning once the CMS answers again", async () => {
        render(<CmsOutageNotice />);
        respondWith(503);
        await request();

        respondWith(200);
        await request();

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("does not treat a missing record (404) as an outage", async () => {
        render(<CmsOutageNotice />);

        respondWith(404);
        await request();

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
});
