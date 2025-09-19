"use client";

import { useEffect, useState, useRef, MutableRefObject } from "react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { createClient } from "@supabase/supabase-js";

type Person = {
  Name: string;
  Company: string;
  Email: string;
  Souvenir?: string;
};

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BulkQrGenerator() {
  const [data, setData] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const cardRefs: MutableRefObject<(HTMLDivElement | null)[]> = useRef([]);

  // Load JSON from Supabase Storage (private bucket)
  useEffect(() => {
    const fetchData = async () => {
      const { data: fileData, error } = await supabase.storage
        .from("philsan_json") // ⬅️ your bucket name
        .download("selected_philsan_digital.json"); // ⬅️ file path inside bucket

      if (error) {
        console.error("Error downloading file:", error);
        return;
      }

      if (fileData) {
        const text = await fileData.text();
        const json = JSON.parse(text);
        setData(json);
      }
    };

    fetchData();
  }, []);

  // Bulk download as ZIP (stickers only, no header/buttons)
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

  // Split into pages of 16
  const chunkArray = <T,>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );

  const pages = chunkArray(data, 16);

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-6 flex flex-col justify-center items-center">
      {/* Only visible on screen */}
      <div className="no-print flex justify-center items-center gap-4 mb-6">
        <button
          onClick={downloadAllAsZip}
          disabled={loading}
          className="px-6 py-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold shadow-md transition-transform transform hover:scale-105"
        >
          {loading ? "Downloading..." : "Download All as ZIP"}
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-transform transform hover:scale-105"
        >
          Print Layout
        </button>
      </div>

      {/* Render multiple A4 pages */}
      {pages.map((page, pageIndex) => (
        <div key={pageIndex} className="a4-page">
          {page.map((person, index) => {
            const globalIndex = pageIndex * 16 + index;
            return (
              <div
                key={globalIndex}
                ref={(el) => {
                  cardRefs.current[globalIndex] = el;
                }}
                className="card"
              >
                {/* QR */}
                <div className="qr">
                  <QRCodeCanvas
                    value={person.Email}
                    fgColor="#000000"
                    bgColor="#ffffff"
                    size={94}
                  />
                </div>

                {/* Info */}
                <div className="info">
                  <h3 className="name">{person.Name}</h3>
                  <p className="company">{person.Company || " "}</p>
                  <p className="souvenir">{person.Souvenir || ""}</p>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <style jsx global>{`
        /* Hide header/buttons in print */
        @media print {
          .no-print {
            display: none !important;
          }
        }

        /* A4 size page */
        .a4-page {
          width: 210mm;
          height: 297mm;
          background: #fff;
          color: #000000;
          display: grid;
          grid-template-columns: repeat(2, 1fr); /* 2 per row */
          grid-template-rows: repeat(8, auto); /* 8 rows = 16 stickers */
          gap: 1px;
          padding: 12px;
          box-sizing: border-box;
          page-break-after: always;
        }

        /* Individual card */
        .card {
          display: grid;
          grid-template-columns: 40% 60%;
          width: 76.2mm;
          height: 35.0012mm;
          border: 1px solid #000;
          background: #fff;
          overflow: hidden;
          position: relative;
        }

        .qr {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .info {
          position: relative;
          padding: 4px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .name {
          font-size: 11pt;
          font-weight: bold;
          margin: 0;
          line-height: 1.2;
        }

        .company {
          font-size: 8pt;
          margin: 0;
        }

        .souvenir {
          position: absolute;
          bottom: 2px;
          right: 4px;
          font-size: 6pt;
          font-style: italic;
          color: #666;
        }

        @media print {
          body {
            margin: 0;
          }
          .a4-page {
            margin: 0 auto;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}
