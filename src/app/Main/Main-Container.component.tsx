import React, { useEffect, useContext } from "react";
import _ from "lodash";
import { DBentry, DBtype } from "../Shared/Isolat.model";
import { DataContext } from "../Shared/Context/DataContext";
import { MainLayoutComponent } from "./Main-Layout.component";
import { HeaderLayoutComponent as Header } from "./Header/Header.component";
import { BodyRouterComponent as Body } from "./Body/Body-Router.component";
import { FooterLayoutComponent as Footer } from "./Footer/Footer-Layout.component";

const BASE_URL = "/v1/mockdata";

export function MainContainerComponent(): JSX.Element {
    const { setData } = useContext(DataContext);

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

    const getData = async (): Promise<void> => {
        const r: Response = await fetch(BASE_URL);
        const dataProp: DBentry[] = await r.json();
        let i = 0;
        for (i; i < dataProp.length; i += 1) {
            dataProp[i].uniqueId = i + 1;
        }
        const filterValues = _.uniq(_.map(dataProp, "Serovar"));
        setData({
            ZNData: dataProp,
            keyValues: keyValueProps,
            uniqueValues: filterValues,
        });
    };

    useEffect((): void => {
        getData();
    }, []);

    const headerElement = <Header />;
    const bodyElement = <Body />;
    const footerElement = <Footer />;

    return (
        <MainLayoutComponent
            headerComponent={headerElement}
            bodyComponent={bodyElement}
            footerComponent={footerElement}
        />
    );
}
