"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { CellEditingStoppedEvent, ColDef, GridReadyEvent } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

ModuleRegistry.registerModules([AllCommunityModule]);

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
  const services = useQuery(api.services.fetch, {
    limit: 500,
    onlyPublic: false,
  });
  const update = useMutation(api.services.update);
  const gridRef = useRef<AgGridReact<Row>>(null);

  const [rowData, setRowData] = useState<Row[]>([]);

  useEffect(() => {
    if (services?.services) {
      const mapped = services.services.map((svc: any) => ({
        _id: svc._id,
        name: svc.title ?? svc.slug ?? "",
        description: svc.notes ?? "",
        price: typeof svc.priceCents === "number" ? svc.priceCents / 100 : 0,
        isPublic: !!svc.isPublic,
        slug: svc.slug ?? "",
        archived: !!svc.archived,
        buttonLabel: "",
        buttonHref: svc.sourceUrl ?? "",
        imageUrl: svc.imageUrl ?? "",
        sku: svc.sku ?? svc.slug ?? "",
        category: svc.category ?? "",
        stockQty: svc.stockQty ?? 0,
        minQty: svc.minQty ?? 0,
        maxQty: svc.maxQty ?? 0,
        tags: Array.isArray(svc.tags) ? svc.tags : [],
        isFeatured: svc.isFeatured ?? false,
        cost: typeof svc.costCents === "number" ? svc.costCents / 100 : 0,
        createdBy: svc.createdBy ?? "",
        updatedBy: svc.updatedBy ?? "",
        createdAt: svc.createdAt ?? 0,
        updatedAt: svc.updatedAt ?? 0,
      }));
      setRowData(mapped);
    }
  }, [services]);

  const colDefs = useMemo<ColDef<Row>[]>(
    () => [
      { headerName: "Name", field: "name", editable: true, minWidth: 160 },
      {
        headerName: "Description",
        field: "description",
        editable: true,
        flex: 1,
        minWidth: 220,
      },
      {
        headerName: "Price ($)",
        field: "price",
        editable: true,
        valueParser: (p) => Number(p.newValue) || 0,
        width: 110,
      },
      {
        headerName: "Cost ($)",
        field: "cost",
        editable: true,
        valueParser: (p) => Number(p.newValue) || 0,
        width: 110,
      },
      {
        headerName: "Public",
        field: "isPublic",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: [true, false] },
        width: 110,
      },
      { headerName: "Slug", field: "slug", editable: true, minWidth: 140 },
      {
        headerName: "Archived",
        field: "archived",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: [true, false] },
        width: 120,
      },
      { headerName: "SKU", field: "sku", editable: true, minWidth: 120 },
      { headerName: "Category", field: "category", editable: true, minWidth: 140 },
      {
        headerName: "Stock",
        field: "stockQty",
        editable: true,
        valueParser: (p) => Number(p.newValue) || 0,
        width: 100,
      },
      {
        headerName: "Min",
        field: "minQty",
        editable: true,
        valueParser: (p) => Number(p.newValue) || 0,
        width: 90,
      },
      {
        headerName: "Max",
        field: "maxQty",
        editable: true,
        valueParser: (p) => Number(p.newValue) || 0,
        width: 90,
      },
      {
        headerName: "Tags",
        field: "tags",
        editable: true,
        valueGetter: (p) => (p.data?.tags ?? []).join(", "),
        valueSetter: (p) => {
          p.data.tags = String(p.newValue || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          return true;
        },
        minWidth: 160,
      },
      {
        headerName: "Featured",
        field: "isFeatured",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: [true, false] },
        width: 120,
      },
      {
        headerName: "Button Label",
        field: "buttonLabel",
        editable: true,
        minWidth: 160,
      },
      {
        headerName: "Button Href",
        field: "buttonHref",
        editable: true,
        minWidth: 220,
      },
      { headerName: "Image URL", field: "imageUrl", editable: true, minWidth: 200 },
      {
        headerName: "Updated",
        field: "updatedAt",
        valueFormatter: (p) => new Date(p.value).toLocaleString(),
        width: 170,
      },
      {
        headerName: "Created",
        field: "createdAt",
        valueFormatter: (p) => new Date(p.value).toLocaleString(),
        width: 170,
      },
      { headerName: "Created By", field: "createdBy", editable: true, minWidth: 140 },
      { headerName: "Updated By", field: "updatedBy", editable: true, minWidth: 140 },
    ],
    []
  );

  const onCellEditingStopped = async (e: CellEditingStoppedEvent<Row, any>) => {
    if (!e.data?._id || e.oldValue === e.value) return;
    const key = e.colDef.field as keyof Row;
    const patch: Record<string, any> = {};

    if (key === "name") patch.title = String(e.value ?? "");
    else if (key === "description") patch.notes = String(e.value ?? "");
    else if (key === "price") patch.priceCents = Math.round(Number(e.value) * 100) || 0;
    else if (key === "isPublic") patch.isPublic = Boolean(e.value);
    else if (key === "archived") patch.archived = Boolean(e.value);
    else if (key === "category") patch.category = String(e.value ?? "");
    else if (key === "tags") patch.tags = Array.isArray(e.value) ? e.value : String(e.value ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    else return;

    await update({ id: e.data._id as any, ...patch });
  };

  const gridReady = (_e: GridReadyEvent) => {};

  return (
    <div className="p-4">
      <h1 className="mb-3 text-xl font-semibold">Services Inventory</h1>
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
