"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QrGenerator() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [affiliation, setAffiliation] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      {/* Input form */}
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mb-6">
        <h2 className="text-xl font-bold mb-4 text-center">QR Generator</h2>
        <input
          type="text"
          placeholder="Name"
          className="w-full border p-2 rounded mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Affiliation"
          className="w-full border p-2 rounded mb-3"
          value={affiliation}
          onChange={(e) => setAffiliation(e.target.value)}
        />
      </div>

      {/* QR + Info Display */}
      {email && (
        <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-md">
          {/* QR Code */}
          <div className="flex items-center justify-center">
            <QRCodeCanvas value={email} size={150} />
          </div>

          {/* Name + Affiliation */}
          <div className="flex flex-col justify-center">
            <h3 className="text-lg font-semibold">{name || "Full Name"}</h3>
            <p className="text-gray-600">{affiliation || "Affiliation"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
