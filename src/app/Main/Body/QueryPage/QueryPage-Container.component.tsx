import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import _ from "lodash";
import { DataContext } from "../../../Shared/Context/DataContext";
import { DBentry, DBtype } from "../../../Shared/Isolat.model";
import { mockDataURL } from "../../../Shared/URLs";
import { QueryPageComponent as QPComp } from "./QueryPage.component";
import {
    FilterInterface,
    mainFilterAttributes,
} from "../../../Shared/Filter.model";
import {
    defaultFilter,
    FilterContext,
} from "../../../Shared/Context/FilterContext";
import { TableContext } from "../../../Shared/Context/TableContext";
import { getFilterFromPath } from "../../../Core/getFilterFromPath.service";
import { createPathString } from "../../../Core/createFilterPath.service";
import { getTableFromPath } from "../../../Core/getTableFromPath.service";

export function QueryPageContainer(): JSX.Element {
    const { data, setData } = useContext(DataContext);
    const { filter, setFilter } = useContext(FilterContext);
    const { table, setTable } = useContext(TableContext);
    const history = useHistory();

    const keyValueProps: DBtype[] = [
        "Erreger",
        "BfR_Isolat_Nr",
        "Projektname",
        "ESBL_AmpC_Carb",
        "Spa_Typ",
        "Entero_Spez",
        "Campy_Spez",
        "Serovar",
        "Serotyp",
        "O_Gruppe",
        "H_Gruppe",
        "stx1",
        "stx2",
        "Shigatoxin",
        "eae",
        "e_hly_gen",
        "AMP_Res",
        "ZI_Res",
        "HL_Res",
        "IP_Res",
        "LI_Res",
        "COL_Res",
        "RY_Res",
        "FOT_Res",
        "OX_Res",
        "FUS_Res",
        "GEN_Res",
        "AN_Res",
        "LZD_Res",
        "MERO_Res",
        "UP_Res",
        "NAL_Res",
        "EN_Res",
        "RIF_Res",
        "SMX_Res",
        "TR_Res",
        "SYN_Res",
        "TAZ_Res",
        "ET_Res",
        "GC_Res",
        "IA_Res",
        "TMP_Res",
        "AN_Res",
        "Programm",
        "OriginalnrDesEinsenders",
        "Matrix",
        "Land",
    ];

    const BASE_URL: string = mockDataURL;

    const getData = async (): Promise<void> => {
        const r: Response = await fetch(BASE_URL);
        const dataProp: DBentry[] = await r.json();
        let i = 0;
        for (i; i < dataProp.length; i += 1) {
            dataProp[i].uniqueId = i + 1;
        }

        const uniqueValuesObject: FilterInterface = { ...defaultFilter };

        mainFilterAttributes.forEach((filterElement) => {
            const uniqueValuesPerElement: string[] = _.uniq(
                _.map(dataProp, filterElement)
            );
            uniqueValuesObject[filterElement] = uniqueValuesPerElement;
        });

        setData({
            ZNData: dataProp,
            ZNDataFiltered: dataProp,
            keyValues: keyValueProps,
            uniqueValues: uniqueValuesObject,
        });
    };

    useEffect(() => {
        getData();
        setFilter(
            getFilterFromPath(history.location.search, mainFilterAttributes)
        );
        const [rowFromPath, colFromPath] = getTableFromPath(
            history.location.search
        );
        setTable({
            ...table,
            row: rowFromPath,
            column: colFromPath,
        });
    }, []);

    useEffect((): void => {
        history.push(`?${createPathString(filter, table)}`);
    }, [filter, table]);

    let returnValue = <p> Loading data ... </p>;
    if (_.isEmpty(data.ZNData) === false) {
        returnValue = <QPComp />;
    }

    return returnValue;
}
