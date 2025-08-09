"use client";

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// ⛔️ Remove NextAuth-era type import
// import { SelectProduct } from "@/lib/db";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Minimal, Convex-friendly shape.
// If your <Product> row needs more fields, add them here.
export type ProductRow = {
  _id ? : string; // Convex docs use _id
  id ? : string; // fallback if you still pass id
  name: string;
  status ? : string;
  price ? : number;
  totalSales ? : number;
  createdAt ? : number | string;
  image ? : string;
};

export function ProductsTable({
  products,
  offset,
  totalProducts,
}: {
  products ? : ProductRow[] | null;
  offset: number; // slice start index (0-based)
  totalProducts: number; // total count for pagination display
}) {
  const router = useRouter();
  const productsPerPage = 5;
  
  // ✅ Guard so .map never explodes
  const rows = Array.isArray(products) ? products : [];
  
  function prevPage() {
    const prev = Math.max(0, offset - productsPerPage);
    router.push(`/?offset=${prev}`, { scroll: false });
  }
  
  function nextPage() {
    const next = Math.min(
      Math.max(0, totalProducts - (totalProducts % productsPerPage || productsPerPage)),
      offset + productsPerPage
    );
    router.push(`/?offset=${next}`, { scroll: false });
  }
  
  // Display range: human-readable 1-based indices
  const start = totalProducts === 0 ? 0 : Math.min(offset + 1, totalProducts);
  const end = Math.min(offset + productsPerPage, totalProducts);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
        <CardDescription>
          Manage your products and view their sales performance.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead className="hidden md:table-cell">Total Sales</TableHead>
              <TableHead className="hidden md:table-cell">Created at</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <td className="py-6 text-sm text-muted-foreground" colSpan={7}>
                  No products yet.
                </td>
              </TableRow>
            ) : (
              rows.map((product) => (
                // ✅ Works with Convex (_id) or legacy id
                <Product key={String(product._id ?? product.id)} product={product as any} />
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter>
        <div className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Showing <strong>{start}-{end}</strong> of{" "}
            <strong>{totalProducts}</strong> products
          </div>
          <div className="flex">
            <Button
              onClick={prevPage}
              variant="ghost"
              size="sm"
              type="button"
              disabled={offset <= 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              onClick={nextPage}
              variant="ghost"
              size="sm"
              type="button"
              disabled={offset + productsPerPage >= totalProducts}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}