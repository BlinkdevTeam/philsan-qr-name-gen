"use client";

import { useEffect, useState, useRef, MutableRefObject } from "react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";

type Person = {
  Name: string;
  Affiliation: string;
  Email: string;
};

export default function BulkQrGenerator() {
  const [data, setData] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false); // 👈 loading state
  const cardRefs: MutableRefObject<(HTMLDivElement | null)[]> = useRef([]);

  // Load JSON from /public
  useEffect(() => {
    fetch("/data/philsan_names_with_affiliations.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  // Bulk download as ZIP
  const downloadAllAsZip = async () => {
    setLoading(true); // 👈 start loading
    const zip = new JSZip();

    for (let i = 0; i < data.length; i++) {
      const card = cardRefs.current[i];
      if (!card) continue;

      const canvas = await html2canvas(card, { backgroundColor: "#ffffff" });
      const dataUrl = canvas.toDataURL("image/png");

      // Convert base64 to Blob and add to ZIP
      const imgData = dataUrl.split(",")[1];
      zip.file(`${data[i].Name}_qr.png`, imgData, { base64: true });
    }

    // Generate and trigger download
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "bulk_qr_codes.zip");

    setLoading(false); // 👈 stop loading
  };

  return (
    <div className="min-h-screen bg-[#141414] p-6 flex flex-col justify-center items-center">
      <h2 className="text-2xl font-bold text-center mb-6 text-white">
        Bulk QR Generator
      </h2>

      <div className="flex justify-center mb-6">
        <button
          onClick={downloadAllAsZip}
          disabled={loading}
          className={`px-4 py-2 rounded transition ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-[#dfd00a] hover:bg-gray-800 text-white"
          }`}
        >
          {loading ? "Downloading..." : "Download All as ZIP"}
        </button>
      </div>

      {/* Display cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 w-fit">
        {data.map((person, index) => (
          <div
            key={index}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className="grid grid-cols-[40%_60%] gap-2 bg-white w-[230px] h-[100px] shadow-md text-black p-2"
          >
            {/* QR */}
            <div className="flex items-center justify-center">
              <QRCodeCanvas
                value={person.Email}
                size={76}
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center text-black overflow-hidden pr-2 py-2">
              <h3
                className="text-[10px] font-semibold leading-[12px] break-words"
                style={{ minHeight: "14px" }}
              >
                {person.Name}
              </h3>
              <p className="text-[9px] leading-[11px] break-words">
                {person.Affiliation || " "}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
