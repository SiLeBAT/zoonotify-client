export interface IsolateApiInterface {
    isolates: {
        id: string;
        microorganism: string;
        state: string;
        year: string;
        samplingReason: string;
        samplingLocation: string;
        samplingOrigin: string;
        matrix: string;
        matrixDetail: string;
        supercategory: string;
        production: string;
        characteristics: {
            sepecies: string;
            serovar: string;
            serotype: string;
            spa_typ: string;
            o_group: string;
            h_group: string;
            stx1: string;
            stx2: string;
            eae: string;
            e_hly: string;
            ampc_carba_phenotype: string;
        };
        resistences: {
            amp: {
                value: string;
                active: boolean;
            };
            azi: {
                value: string;
                active: boolean;
            };
            chl: {
                value: string;
                active: boolean;
            };
            cip: {
                value: string;
                active: boolean;
            };
            cli: {
                value: string;
                active: boolean;
            };
            col: {
                value: string;
                active: boolean;
            };
            dap: {
                value: string;
                active: boolean;
            };
            ery: {
                value: string;
                active: boolean;
            };
            etp: {
                value: string;
                active: boolean;
            };
            fep: {
                value: string;
                active: boolean;
            };
            fop: {
                value: string;
                active: boolean;
            };
            fox: {
                value: string;
                active: boolean;
            };
            fus: {
                value: string;
                active: boolean;
            };
            f_c: {
                value: string;
                active: boolean;
            };
            gen: {
                value: string;
                active: boolean;
            };
            imi: {
                value: string;
                active: boolean;
            };
            kan: {
                value: string;
                active: boolean;
            };
            lzd: {
                value: string;
                active: boolean;
            };
            mero: {
                value: string;
                active: boolean;
            };
            mup: {
                value: string;
                active: boolean;
            };
            nal: {
                value: string;
                active: boolean;
            };
            pen: {
                value: string;
                active: boolean;
            };
            rif: {
                value: string;
                active: boolean;
            };
            smx: {
                value: string;
                active: boolean;
            };
            str: {
                value: string;
                active: boolean;
            };
            syn: {
                value: string;
                active: boolean;
            };
            taz: {
                value: string;
                active: boolean;
            };
            tec: {
                value: string;
                active: boolean;
            };
            tet: {
                value: string;
                active: boolean;
            };
            tgc: {
                value: string;
                active: boolean;
            };
            tia: {
                value: string;
                active: boolean;
            };
            tmp: {
                value: string;
                active: boolean;
            };
            trm: {
                value: string;
                active: boolean;
            };
            t_c: {
                value: string;
                active: boolean;
            };
            van: {
                value: string;
                active: boolean;
            };
        };
    }[];
}


export type DBentry = IsolateApiInterface["isolates"];

export type DBkey = keyof IsolateApiInterface["isolates"][0];
