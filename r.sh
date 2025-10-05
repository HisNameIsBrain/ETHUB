#!/bin/bash
# setup-ethub-app.sh
# Bash script to migrate your ETHUB project to Next.js app router with assistant integration

set -e

echo "🔧 Setting up ETHUB app router structure..."

# 1️⃣ Create app folders
mkdir -p app/repair
mkdir -p app/api/portal/invoices
mkdir -p app/api/portal/mint-token

echo "✅ Created app router folders"

# 2️⃣ Move portal page to app router
cat > app/repair/page.tsx << 'EOF'
"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import AssistantLauncher from "@/components/AssistantLauncher";

export default function RepairPage() {
  const [lastAssistantText, setLastAssistantText] = useState<string>("");

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Client Portal</h1>
      <p className="text-sm text-muted-foreground">
        Track your repair status, invoices, and communications here.
      </p>

      <Card className="p-4">
        <h2 className="font-medium text-lg mb-2">Repairs</h2>
        {lastAssistantText ? (
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
            {lastAssistantText}
          </pre>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Start a conversation with the assistant to generate repair info.
          </p>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="font-medium text-lg mb-2">Invoices</h2>
        <p className="text-sm text-muted-foreground">
          View and download invoices for completed services.
        </p>
      </Card>

      <AssistantLauncher
        onAssistantMessage={(message: string) => setLastAssistantText(message)}
      />
    </div>
  );
}
EOF

echo "✅ Repair page created at app/repair/page.tsx"

# 3️⃣ Add API route: invoices
cat > app/api/portal/invoices/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.PORTAL_JWT_SECRET ?? "";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const match = auth.match(/^Bearer (.+)$/);
  if (!match) return NextResponse.json({ error: "Missing token" }, { status: 401 });

  const token = match[1];
  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const body = await req.json();
  const invoice = { ...body, createdBy: payload.sub ?? "unknown", createdAt: new Date().toISOString() };
  console.log("Invoice received:", invoice);

  return NextResponse.json({ id: "inv_" + Math.random().toString(36).slice(2,9) }, { status: 201 });
}
EOF

echo "✅ API route created at app/api/portal/invoices/route.ts"

# 4️⃣ Add API route: mint-token
cat > app/api/portal/mint-token/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.PORTAL_JWT_SECRET ?? "";
const TOKEN_TTL_SECONDS = Number(process.env.PORTAL_TOKEN_TTL_SECONDS ?? 300);

export async function POST(req: NextRequest) {
  const { ticket, sub } = await req.json() ?? {};
  if (!ticket || !sub) return NextResponse.json({ error: "ticket and sub required" }, { status: 400 });

  const now = Math.floor(Date.now() / 1000);
  const token = jwt.sign({ sub, aud: "ethub-portal", ticket, iat: now, exp: now + TOKEN_TTL_SECONDS }, JWT_SECRET);
  const link = `${process.env.PORTAL_URL ?? "https://portal.example.com"}/repair?token=${encodeURIComponent(token)}&ticket=${encodeURIComponent(ticket)}`;

  return NextResponse.json({ token, link, expiresIn: TOKEN_TTL_SECONDS }, { status: 201 });
}
EOF

echo "✅ API route created at app/api/portal/mint-token/route.ts"

# 5️⃣ Reminder
echo "✅ All files created. Make sure:"
echo "- AssistantLauncher component exists in components/"
echo "- JWT secret is set in environment variables"
echo "- All other UI components are updated for app router"
echo ""
echo "Next: Start dev server with 'npm run dev' and test repair page + API endpoints."
