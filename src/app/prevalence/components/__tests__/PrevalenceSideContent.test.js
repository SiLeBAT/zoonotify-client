import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { PrevalenceSideContent } from "../PrevalenceSideContent";
import { usePrevalenceFilters } from "../PrevalenceDataContext";

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key, fallback) => fallback ?? key,
        i18n: { on: jest.fn(), off: jest.fn(), language: "en" },
    }),
}));

jest.mock("../PrevalenceDataContext", () => ({
    usePrevalenceFilters: jest.fn(),
}));

jest.mock("../../../shared/infrastructure/api/callApi.service", () => ({
    callApiService: jest.fn().mockResolvedValue({ data: { data: [] } }),
}));

describe("PrevalenceSideContent — year filter", () => {
    let setSelectedYear;

    beforeEach(() => {
        setSelectedYear = jest.fn();
        usePrevalenceFilters.mockReturnValue({
            selectedMicroorganisms: [],
            setSelectedMicroorganisms: jest.fn(),
            microorganismOptions: [],
            selectedSampleOrigins: [],
            setSelectedSampleOrigins: jest.fn(),
            sampleOriginOptions: [],
            selectedMatrices: [],
            setSelectedMatrices: jest.fn(),
            matrixOptions: [],
            selectedSamplingStages: [],
            setSelectedSamplingStages: jest.fn(),
            samplingStageOptions: [],
            selectedMatrixGroups: [],
            setSelectedMatrixGroups: jest.fn(),
            matrixGroupOptions: [],
            selectedYear: [],
            setSelectedYear,
            yearOptions: [2020, 2021, 2022],
            selectedSuperCategory: [],
            setSelectedSuperCategory: jest.fn(),
            superCategorySampleOriginOptions: [],
            fetchDataFromAPI: jest.fn(),
            setShowError: jest.fn(),
            fetchOptions: jest.fn(),
            setIsSearchTriggered: jest.fn(),
            loading: false,
        });
    });

    /**
     * Regression guard. MUI's Select overrides each child MenuItem's onClick with
     * a handler that appends `child.props.value` to the selection. The "Select
     * All" row carries no `value`, so that handler used to push `undefined`,
     * which parseInt turned into NaN — surfacing as a literal "NaN" entry in the
     * dropdown and as `filters[samplingYear][$eq]=NaN` on the request, which
     * Strapi answers with "Expected a valid Number, got NaN".
     */
    it("selects every year without emitting NaN when Select All is clicked", () => {
        render(<PrevalenceSideContent />);

        fireEvent.mouseDown(screen.getByLabelText("SAMPLING_YEAR"));
        const listbox = screen.getByRole("listbox");
        fireEvent.click(within(listbox).getByText("Select All"));
        fireEvent.keyDown(listbox, { key: "Escape", code: "Escape" });

        expect(setSelectedYear).toHaveBeenCalled();
        const emitted =
            setSelectedYear.mock.calls[
                setSelectedYear.mock.calls.length - 1
            ][0];
        expect(emitted.every(Number.isFinite)).toBe(true);
        expect([...emitted].sort()).toEqual([2020, 2021, 2022]);
    });

    it("selects a single year without emitting NaN", () => {
        render(<PrevalenceSideContent />);

        fireEvent.mouseDown(screen.getByLabelText("SAMPLING_YEAR"));
        const listbox = screen.getByRole("listbox");
        fireEvent.click(within(listbox).getByText("2021"));
        fireEvent.keyDown(listbox, { key: "Escape", code: "Escape" });

        const emitted =
            setSelectedYear.mock.calls[
                setSelectedYear.mock.calls.length - 1
            ][0];
        expect(emitted).toEqual([2021]);
    });
});

describe("PrevalenceSideContent — reset", () => {
    let filters;

    beforeEach(() => {
        filters = {
            selectedMicroorganisms: ["m1"],
            setSelectedMicroorganisms: jest.fn(),
            microorganismOptions: [{ documentId: "m1", name: "Micro" }],
            selectedSampleOrigins: [],
            setSelectedSampleOrigins: jest.fn(),
            sampleOriginOptions: [],
            selectedMatrices: [],
            setSelectedMatrices: jest.fn(),
            matrixOptions: [],
            selectedSamplingStages: [],
            setSelectedSamplingStages: jest.fn(),
            samplingStageOptions: [],
            selectedMatrixGroups: [],
            setSelectedMatrixGroups: jest.fn(),
            matrixGroupOptions: [],
            selectedYear: [],
            setSelectedYear: jest.fn(),
            yearOptions: [],
            selectedSuperCategory: [],
            setSelectedSuperCategory: jest.fn(),
            superCategorySampleOriginOptions: [],
            fetchDataFromAPI: jest.fn(),
            setShowError: jest.fn(),
            fetchOptions: jest.fn(),
            setIsSearchTriggered: jest.fn(),
            loading: false,
        };
        usePrevalenceFilters.mockReturnValue(filters);
    });

    /**
     * Regression guard. Reset used to call fetchOptions(), which overwrote the
     * options cascaded from the full dataset with the raw CMS lists — and those
     * came back as Strapi's default first page of 25, so later sample origins
     * (wild boar, roe deer, …) and matrices vanished until another filter
     * changed. Clearing the selections is enough: the context recomputes every
     * option list from the full dataset.
     */
    it("clears every selection without refetching the option lists", () => {
        render(<PrevalenceSideContent />);

        fireEvent.click(screen.getByText("RESET_FILTERS"));

        expect(filters.setSelectedMicroorganisms).toHaveBeenCalledWith([]);
        expect(filters.setSelectedSampleOrigins).toHaveBeenCalledWith([]);
        expect(filters.setSelectedMatrices).toHaveBeenCalledWith([]);
        expect(filters.setSelectedSamplingStages).toHaveBeenCalledWith([]);
        expect(filters.setSelectedMatrixGroups).toHaveBeenCalledWith([]);
        expect(filters.setSelectedYear).toHaveBeenCalledWith([]);
        expect(filters.setSelectedSuperCategory).toHaveBeenCalledWith([]);
        expect(filters.fetchOptions).not.toHaveBeenCalled();
    });
});
