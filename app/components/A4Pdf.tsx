"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";
import { QRCodeCanvas } from "qrcode.react";

// Utility: Convert QRCodeCanvas to DataURL for react-pdf Image
function generateQrDataUrl(value: string): string {
  const canvas = document.createElement("canvas");
  const qr = new QRCodeCanvas({ value, size: 100 });
  const container = document.createElement("div");
  container.appendChild(qr as unknown as Node);
  const svg = container.querySelector("canvas") as HTMLCanvasElement;
  return svg?.toDataURL("image/png") || "";
}

// Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
  },
  card: {
    width: "45%", // two cards per row
    margin: "2.5%",
    padding: 10,
    border: "1pt solid #000",
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  qr: {
    width: 80,
    height: 80,
    marginRight: 10,
  },
  textContainer: {
    flexGrow: 1,
  },
  name: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  affiliation: {
    fontSize: 10,
  },
});

export default function A4Pdf({
  data,
}: {
  data: { Name: string; Affiliation: string; Email: string }[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {data.map((person, i) => (
          <View style={styles.card} key={i}>
            <Image src={generateQrDataUrl(person.Email)} style={styles.qr} />
            <View style={styles.textContainer}>
              <Text style={styles.name}>{person.Name}</Text>
              <Text style={styles.affiliation}>
                {person.Affiliation || " "}
              </Text>
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
}
