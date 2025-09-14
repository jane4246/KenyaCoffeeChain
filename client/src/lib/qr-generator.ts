import QRCode from "qrcode";

export interface QRData {
  lotId: string;
  farmerId: string;
  quantity: number;
  processingMethod: string;
  timestamp: string;
}

export async function generateQRCode(data: QRData): Promise<string> {
  try {
    const qrString = await QRCode.toDataURL(JSON.stringify(data));
    return qrString;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

export function parseQRCode(qrData: string): QRData {
  try {
    return JSON.parse(qrData);
  } catch (error) {
    console.error("Error parsing QR code data:", error);
    throw new Error("Invalid QR code data");
  }
}
