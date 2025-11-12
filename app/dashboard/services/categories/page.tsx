"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ServiceCategoriesPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Service Categories</h1>
      <p className="text-sm text-muted-foreground">
        Organize services into categories for easier client browsing.
      </p>

      <Card className="p-4 flex justify-between items-center">
        <span className="font-medium">Example Category</span>
        <Button size="sm" variant="outline">
          <PlusCircle className="h-4 w-4 mr-1" />
          Add
        </Button>
      </Card>
    </div>
  );
}
