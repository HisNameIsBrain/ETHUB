"use client";

import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";

type Row = { id: string; name: string; price?: number; status?: string };

export function ProductsTable({ rows = [] as Row[] }) {
  const data = rows.length ? rows : [
    { id: "1", name: "Sample Service", price: 49.0, status: "active" },
    { id: "2", name: "Screen Repair", price: 99.0, status: "active" },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-medium">{r.name}</TableCell>
            <TableCell>{typeof r.price === "number" ? `$${r.price.toFixed(2)}` : "-"}</TableCell>
            <TableCell className="capitalize">{r.status || "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
