import {
  getConnectedBluetoothPrinter,
  printEscPosToBluetooth,
} from "@/lib/bluetooth-printer";
import { loadPrinterPreferences } from "@/lib/printer-preferences";
import {
  getConnectedUsbPrinter,
  printEscPosToUsb,
  reconnectSavedUsbPrinter,
} from "@/lib/usb-printer";
import { getSavedWifiPrinter, printEscPosToWifi } from "@/lib/wifi-printer";

export async function printEscPosToReceiptPrinter(bytes: Uint8Array): Promise<{
  transport: "usb" | "bluetooth" | "wifi";
  label: string;
}> {
  const transport = loadPrinterPreferences().receipt.transport ?? "usb";

  if (transport === "bluetooth") {
    const connected = getConnectedBluetoothPrinter();
    if (!connected) {
      throw new Error("Bluetooth printer is not connected. Pair it from Printer setup.");
    }
    await printEscPosToBluetooth(bytes);
    return { transport: "bluetooth", label: connected.label };
  }

  if (transport === "wifi") {
    const wifi = getSavedWifiPrinter();
    if (!wifi) {
      throw new Error("Wi‑Fi printer is not configured.");
    }
    await printEscPosToWifi(bytes, wifi);
    return {
      transport: "wifi",
      label: `${wifi.host}:${wifi.port}`,
    };
  }

  const usb = getConnectedUsbPrinter() ?? (await reconnectSavedUsbPrinter());
  if (usb) {
    await printEscPosToUsb(bytes);
    return { transport: "usb", label: usb.label };
  }
  await printEscPosToUsb(bytes);
  const after = getConnectedUsbPrinter();
  return { transport: "usb", label: after?.label ?? "USB printer" };
}
