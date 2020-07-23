import React, { useState, useEffect } from 'react';
import { Button } from '@material-ui/core';
import { DataPageTableComponent as DataTable } from './DataPage-Table.component';
import { DBentry, DBtype } from './DataInterface';


const BASE_URL = '/v1/mockdata'

interface ObjectToCsvProps {
  posts: DBentry[];
  keyValues: DBtype[];
};

function objectToCsv(props: ObjectToCsvProps):void {
  const csvRows: string[] = [];

  const headers: DBtype[] = props.keyValues
  csvRows.push(headers.join(','));
  
  props.posts.forEach((row: DBentry) => {
      const values: string[]  = headers.map((header: DBtype) => {
          const escaped: string  = (`${row[header]}`).replace(/"/g, '\\"')
          return `"${escaped}"`;
      })
      csvRows.push(values.join(','));
  }) 
  const scvData: string = csvRows.join('\n');
  

  const blob: Blob = new Blob([scvData], { type: 'text/csv'});
  const url: string = window.URL.createObjectURL(blob);
  const a: HTMLAnchorElement = document.createElement('a');
  a.href = url;
  a.target="_Blank";
  a.download='download.csv';
  document.body.append(a);
  a.click();
  a.remove();
}

export function DataPageDataContentComponent(): JSX.Element {
    const [posts, setPosts] = useState<DBentry[]>([]);
  
    const keyValues: DBtype[] = ["Erreger", "BfR_Isolat_Nr", "Projektname", "ESBL_AmpC_Carb", "Spa_Typ", "Entero_Spez", "Campy_Spez", "Serovar", "Serotyp", "O_Gruppe", "H_Gruppe", "stx1", "stx2", "Shigatoxin", "eae", "e_hly_gen", "AMP_Res", "ZI_Res", "HL_Res", "IP_Res", "LI_Res", "COL_Res", "RY_Res", "FOT_Res", "OX_Res", "FUS_Res", "GEN_Res", "AN_Res", "LZD_Res", "MERO_Res", "UP_Res", "NAL_Res", "EN_Res", "RIF_Res", "SMX_Res", "TR_Res", "SYN_Res", "TAZ_Res", "ET_Res", "GC_Res", "IA_Res", "TMP_Res", "AN_Res", "Programm", "OriginalnrDesEinsenders", "Matrix", "Land"];


    const getData = async (): Promise<void> => {
      const r: Response = await fetch(BASE_URL);
      const data: DBentry[] = await r.json();
      let i = 0;
      for ( i ; i<data.length ; i += 1){
        data[i].uniqueId = i+1;
      }  
        setPosts(data);
      }

      useEffect(():void => {
        getData();
      }, []);



    return (
      <div>
        <Button variant="contained" color="primary" onClick={() => {
          objectToCsv({posts, keyValues}); 
        }}>
          Download CSV
        </Button>
        <DataTable  posts={posts} keyValues={keyValues} />
      </div>
    );
}