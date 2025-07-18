// app/services/[serviceId]/order/page.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function OrderFormPage() {
  const params = useParams();
  const [imei, setImei] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    await fetch("/api/submit", {
      method: "POST",
      body: JSON.stringify({ serviceId: params.serviceId, imei, email }),
    });
    alert("Submitted!");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-2">IMEI/SN Submission</h1>
      <input
        placeholder="IMEI or Serial Number"
        className="w-full mb-2 border p-2 rounded"
        value={imei}
        onChange={(e) => setImei(e.target.value)}
      />
      <input
        placeholder="Email"
        className="w-full mb-2 border p-2 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        className="bg-green-600 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
}