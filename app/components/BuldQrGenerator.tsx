"use client";

import { useEffect, useState, useRef, MutableRefObject } from "react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";

type Person = {
  Name: string;
  Company: string;
  Email: string;
  Souvenir?: string; // 👈 added Souvenir
};

export default function BulkQrGenerator() {
  const [data, setData] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const cardRefs: MutableRefObject<(HTMLDivElement | null)[]> = useRef([]);

  // Load JSON from /public
  useEffect(() => {
    fetch("/data/selected_philsan_printed.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  // Bulk download as ZIP
  const downloadAllAsZip = async () => {
    setLoading(true);
    const zip = new JSZip();

    for (let i = 0; i < data.length; i++) {
      const card = cardRefs.current[i];
      if (!card) continue;

      const canvas = await html2canvas(card, { backgroundColor: "#ffffff" });
      const dataUrl = canvas.toDataURL("image/png");

      const imgData = dataUrl.split(",")[1];
      zip.file(`${data[i].Name}_qr.png`, imgData, { base64: true });
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "bulk_qr_codes.zip");

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-6 flex flex-col justify-center items-center">
      <h2 className="text-2xl font-bold text-center mb-6 text-black">
        Bulk QR Generator
      </h2>

      <div className="flex justify-center mb-6">
        <button
          onClick={downloadAllAsZip}
          disabled={loading}
          className={`px-4 py-2 rounded transition cursor-pointer ${
            loading
              ? "bg-[#808080] cursor-not-allowed" // safe hex gray
              : "bg-[#dfd00a] hover:bg-[#333333] text-white"
          }`}
        >
          {loading ? "Downloading..." : "Download All as ZIP"}
        </button>
      </div>

      {/* Display cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-fit">
        {data.map((person, index) => (
          <div
            key={index}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className="grid grid-cols-[40%_60%] w-[430px] gap-0 bg-white text-black border"
          >
            {/* QR */}
            <div className="flex items-center justify-center p-4">
              <QRCodeCanvas
                value={person.Email}
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>

            {/* Info */}
            <div className="relative w-full h-auto flex flex-col justify-center text-black overflow-hidden pr-2 py-2 mb-4">
              <h3
                className="text-[24px] font-semibold leading-[26px] break-words"
                style={{ minHeight: "28px" }}
              >
                {person.Name}
              </h3>
              <p className="text-[16px] leading-[20px] break-words">
                {person.Company || " "}
              </p>

              {/* Souvenir fixed at bottom-right */}
              <p
                className="absolute bottom-0 right-2 text-[12px] italic"
                style={{ color: "#666666" }} // ✅ safe gray
              >
                {person.Souvenir || ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
