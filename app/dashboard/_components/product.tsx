import type { ReactNode } from "react";

export type SelectProduct = {
  id: string;
  name: string;
  price?: number;
};

export async function deleteProduct(id: string) {
  // TODO: hook to your real action
  return { ok: true, id };
}

export default function ProductCard({ product }: { product: SelectProduct }) {
  return (
    <div className="border rounded p-3">
      <div className="font-medium">{product.name}</div>
      {product.price != null && <div className="text-sm">$ {product.price}</div>}
    </div>
  );
}
