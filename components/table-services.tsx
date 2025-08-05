
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Service = {
  _id: string;
  name: string;
  deliveryTime: string;
  price: number;
};

type Props = {
  services: Service[];
  isAdmin?: boolean;
  offset?: number;
  servicesPerPage?: number;
  totalServices?: number;
};

export function ServicesTable({
  services,
  isAdmin = false,
  offset = 0,
  servicesPerPage = 5,
  totalServices = 0,
}: Props) {
  const router = useRouter();

  const nextPage = () => {
    router.push(`?offset=${offset + servicesPerPage}`);
  };

  const prevPage = () => {
    router.push(`?offset=${Math.max(0, offset - servicesPerPage)}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
        <CardDescription>
          Browse and manage available services.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Price</TableHead>
              {isAdmin && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((s) => (
              <TableRow key={s._id} className="hover:bg-muted">
                <TableCell>
                  <Link href={`/services/${s._id}`} className="underline text-blue-600">
                    {s.name}
                  </Link>
                </TableCell>
                <TableCell>{s.deliveryTime}</TableCell>
                <TableCell>${s.price}</TableCell>
                {isAdmin && (
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive">
                      Delete
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalServices > servicesPerPage && (
          <div className="flex justify-between mt-4">
            <Button onClick={prevPage} disabled={offset === 0}>
              Previous
            </Button>
            <Button
              onClick={nextPage}
              disabled={offset + servicesPerPage >= totalServices}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

