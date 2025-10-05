"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockRepairs = [
  {
    id: "JOB-12345",
    device: "iPhone 14 Pro",
    issue: "Screen cracked",
    status: "In Progress",
    lastUpdate: "2025-10-01",
  },
  {
    id: "JOB-67890",
    device: "MacBook Air M2",
    issue: "Battery replacement",
    status: "Completed",
    lastUpdate: "2025-09-28",
  },
];

export default function RepairsList() {
  return (
    <div className="space-y-4">
      {mockRepairs.map((job) => (
        <Card key={job.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{job.device}</CardTitle>
            <Badge
              variant={job.status === "Completed" ? "success" : "secondary"}
            >
              {job.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{job.issue}</p>
            <p className="text-xs text-muted-foreground">
              Last update: {job.lastUpdate}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
