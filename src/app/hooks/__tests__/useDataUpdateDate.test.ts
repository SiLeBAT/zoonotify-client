import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import {
    fetchDataUpdateDate,
    formatDataUpdateDate,
} from "../useDataUpdateDate";

jest.mock("../../shared/infrastructure/api/callApi.service", () => ({
    callApiService: jest.fn(),
}));
const mockedCallApiService = callApiService as jest.MockedFunction<
    typeof callApiService
>;

describe("formatDataUpdateDate", () => {
    it("formats as DD.MM.YYYY with zero padding", () => {
        expect(formatDataUpdateDate("2026-03-05T10:00:00")).toBe("05.03.2026");
    });
});

describe("fetchDataUpdateDate", () => {
    afterEach(() => mockedCallApiService.mockReset());

    it("reads the last successful import from the data-import single type", async () => {
        mockedCallApiService.mockResolvedValue({
            status: 200,
            data: { data: { completedAt: "2026-10-19T10:04:36" } },
        });

        await expect(fetchDataUpdateDate()).resolves.toBe("19.10.2026");
        expect(mockedCallApiService.mock.calls[0][0]).toMatch(
            /\/api\/data-import$/
        );
    });

    it("returns null when no import has been recorded", async () => {
        mockedCallApiService.mockResolvedValue({ status: 404 });

        await expect(fetchDataUpdateDate()).resolves.toBeNull();
    });
});
