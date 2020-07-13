import React, { useState, useEffect } from 'react';
import { withStyles, Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { primaryColor } from '../../../Shared/Style/Style-MainTheme.component';

const BASE_URL = '/v1/mockdata'

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  tableCell: {
    wordWrap: 'break-word',
  }
});

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: primaryColor,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  }),
)(TableCell);

export function DataPageDataContentComponent(): JSX.Element {
    const [posts, setPosts] = useState([]);
    const [keyValues, setKeyValues] = useState<string[]>([]);
    const classes = useStyles();

    
    const getData = async (): Promise<void> => {
        const r = await fetch(BASE_URL);
        const data = await r.json();
        let i = 0;
        for ( i ; i<data.length ; i += 1){
          data[i].uniqueId = i+1;
        }
        const values = Object.keys(data[0]);    
        setPosts(data);
        setKeyValues(values);
    }

    useEffect(():void => {
      getData();
    }, []);

    const keyUniqueId = 'uniqueId';
    return (
        <TableContainer component={Paper}>
        <Table stickyHeader className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
                {keyValues.map((keyValue:string) => (
                    <StyledTableCell>{keyValue}</StyledTableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((post) => (
                <TableRow key={post[keyUniqueId]}>
                    {keyValues.map((keyValue:string) => (
                        <TableCell className={classes.tableCell} component="th" scope="row">{post[keyValue]}</TableCell>
                    ))}
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
}