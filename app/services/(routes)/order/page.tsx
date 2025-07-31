"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

export default function OrderFormPage() {
  const params = useParams();
  const [imei, setImei] = useState("");
  const [email, setEmail] = useState("");
  
  const handleSubmit = async () => {
    await fetch("/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        serviceId: params.serviceId as string,
        imei,
        email,
      }),
    });
    alert("Submitted!");
  };
  
  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Submit IMEI/SN</h1>

      <input
        type="text"
        placeholder="IMEI / Serial Number"
        value={imei}
        onChange={(e) => setImei(e.target.value)}
        className="w-full p-2 mb-3 border rounded"
      />

      <input
        type="email"
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 mb-3 border rounded"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
      >
        Submit
      </button>
    </div>
  );
}