"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridReadyEvent, CellEditingStoppedEvent } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type Row = {
  _id: string;
  name: string;
  description: string;
  price: number;
  isPublic: boolean;
  slug: string;
  archived: boolean;
  buttonLabel: string;
  buttonHref: string;
  imageUrl: string;
  // new inventory fields
  sku: string;
  category: string;
  stockQty: number;
  minQty: number;
  maxQty: number;
  tags: string[];
  isFeatured: boolean;
  cost: number;
  createdBy: string;
  updatedBy: string;

  createdAt: number;
  updatedAt: number;
};

export default function InventoryPage() {
  const rows = useQuery(api["services.inventory"].list) as Row[] | undefined;
  const update = useMutation(api["services.inventory"].update);

  const [rowData, setRowData] = useState<Row[]>([]);
  useEffect(() => { if (rows) setRowData(rows); }, [rows]);

  const colDefs = useMemo<ColDef<Row>[]>(() => [
    { headerName: "Name", field: "name", editable: true, minWidth: 160 },
    { headerName: "Description", field: "description", editable: true, flex: 1, minWidth: 220 },
    { headerName: "Price ($)", field: "price", editable: true, valueParser: p => Number(p.newValue) || 0, width: 110 },
    { headerName: "Cost ($)", field: "cost", editable: true, valueParser: p => Number(p.newValue) || 0, width: 110 },
    { headerName: "Public", field: "isPublic", editable: true, cellEditor: "agSelectCellEditor", cellEditorParams: { values: [true,false] }, width: 110 },
    { headerName: "Slug", field: "slug", editable: true, minWidth: 140 },
    { headerName: "Archived", field: "archived", editable: true, cellEditor: "agSelectCellEditor", cellEditorParams: { values: [true,false] }, width: 120 },
    { headerName: "SKU", field: "sku", editable: true, minWidth: 120 },
    { headerName: "Category", field: "category", editable: true, minWidth: 140 },
    { headerName: "Stock", field: "stockQty", editable: true, valueParser: p => Number(p.newValue) || 0, width: 100 },
    { headerName: "Min", field: "minQty", editable: true, valueParser: p => Number(p.newValue) || 0, width: 90 },
    { headerName: "Max", field: "maxQty", editable: true, valueParser: p => Number(p.newValue) || 0, width: 90 },
    { headerName: "Tags", field: "tags", editable: true, valueGetter: p => (p.data?.tags ?? []).join(", "), valueSetter: p => { p.data.tags = String(p.newValue || "").split(",").map(s=>s.trim()).filter(Boolean); return true; }, minWidth: 160 },
    { headerName: "Featured", field: "isFeatured", editable: true, cellEditor: "agSelectCellEditor", cellEditorParams: { values: [true,false] }, width: 120 },
    { headerName: "Button Label", field: "buttonLabel", editable: true, minWidth: 160 },
    { headerName: "Button Href", field: "buttonHref", editable: true, minWidth: 220 },
    { headerName: "Image URL", field: "imageUrl", editable: true, minWidth: 200 },
    { headerName: "Updated", field: "updatedAt", valueFormatter: p => new Date(p.value).toLocaleString(), width: 170 },
    { headerName: "Created", field: "createdAt", valueFormatter: p => new Date(p.value).toLocaleString(), width: 170 },
    { headerName: "Created By", field: "createdBy", editable: true, minWidth: 140 },
    { headerName: "Updated By", field: "updatedBy", editable: true, minWidth: 140 },
  ], []);

  const onCellEditingStopped = async (e: CellEditingStoppedEvent<Row, any>) => {
    if (!e.data?._id || e.oldValue === e.value) return;
    const key = e.colDef.field as keyof Row;
    const patch: any = { [key]: e.value };
    await update({ id: e.data._id as any, patch });
  };

  const gridReady = (_e: GridReadyEvent) => {};
  const gridRef = useRef<AgGridReact<Row>>(null);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-3">Services Inventory</h1>
      <div className="ag-theme-quartz" style={{ height: "75vh", width: "100%" }}>
        <AgGridReact<Row>
          ref={gridRef}
          rowData={rowData}
          columnDefs={colDefs}
          animateRows
          rowSelection="single"
          suppressClickEdit={false}
          editType="fullRow"
          onGridReady={gridReady}
          onCellEditingStopped={onCellEditingStopped}
          pagination
          paginationPageSize={25}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
        />
      </div>
    </div>
  );
}
