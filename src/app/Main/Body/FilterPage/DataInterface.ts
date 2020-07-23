export interface DBentry extends Record<DBtype, string | (0|1) | number> {
    Erreger: string;
    BfR_Isolat_Nr: string;
    Projektname: string;
    ESBL_AmpC_Carb: string;
    Spa_Typ: string;
    Entero_Spez: string;
    Campy_Spez: string;
    Serovar: string;
    Serotyp: string;
    O_Gruppe: string;
    H_Gruppe: string;
    stx1: string;
    stx2: string;
    Shigatoxin: string;
    eae: string;
    e_hly_gen: string;
    AMP_Res: 0 | 1;
    AZI_Res: 0 | 1;
    CHL_Res: 0 | 1;
    CIP_Res: 0 | 1;
    CLI_Res: string;
    COL_Res: 0 | 1;
    ERY_Res: string;
    FOT_Res: 0 | 1;
    FOX_Res: string;
    FUS_Res: string;
    GEN_Res: 0 | 1;
    KAN_Res: string;
    LZD_Res: string;
    MERO_Res: 0 | 1;
    MUP_Res: string;
    NAL_Res: 0 | 1;
    PEN_Res: string;
    RIF_Res: string;
    SMX_Res: 0 | 1;
    STR_Res: string;
    SYN_Res: string;
    TAZ_Res: 0 | 1;
    TET_Res: 0 | 1;
    TGC_Res: 0 | 1;
    TIA_Res: string;
    TMP_Res: 0 | 1;
    VAN_Res: string;
    Programm: string;
    OriginalnrDesEinsenders: string;
    Matrix: string;
    Land: string;
    uniqueId: number;
};

export type DBtype = "Erreger" | "BfR_Isolat_Nr" | "Projektname" | "ESBL_AmpC_Carb" | "Spa_Typ" | "Entero_Spez" | "Campy_Spez" | "Serovar" | "Serotyp" | "O_Gruppe" | "H_Gruppe" | "stx1" | "stx2" | "Shigatoxin" | "eae" | "e_hly_gen" | "AMP_Res" | "ZI_Res" | "HL_Res" | "IP_Res" | "LI_Res" | "COL_Res" | "RY_Res" | "FOT_Res" | "OX_Res" | "FUS_Res" | "GEN_Res" | "AN_Res" | "LZD_Res" | "MERO_Res" | "UP_Res" | "NAL_Res" | "EN_Res" | "RIF_Res" | "SMX_Res" | "TR_Res" | "SYN_Res" | "TAZ_Res" | "ET_Res" | "GC_Res" | "IA_Res" | "TMP_Res" | "AN_Res" | "Programm" | "OriginalnrDesEinsenders" | "Matrix" | "Land" | "uniqueId";