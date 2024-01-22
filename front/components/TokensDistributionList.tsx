"use client";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import React from "react";

interface TokenDistributionListProps {
  data: {
    tokenId: number;
    tokenName: string;
    amountOwned: number;
    marketValue: number;
  }[];
}

const TokensDistributionList = ({ data }: TokenDistributionListProps) => {
  return (
    <TableContainer className="shadow-none" component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell className="font-bold" align="center">
              Token
            </TableCell>
            <TableCell className="font-bold" align="center">
              Amount owned
            </TableCell>
            <TableCell className="font-bold" align="center">
              Market value
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.tokenId}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell align="center">{row.tokenName}</TableCell>
              <TableCell align="center">{row.amountOwned}</TableCell>
              <TableCell align="center">{row.marketValue}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TokensDistributionList;
