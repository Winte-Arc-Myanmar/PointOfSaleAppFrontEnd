import { EscPosEncoder } from "@/core/application/print/EscPosEncoder";
import {
  loadPrinterPreferences,
  updateReceiptPrinterPreferences,
} from "@/lib/printer-preferences";

export interface UsbPrinterDeviceInfo {
  label: string;
  vendorId: number;
  productId: number;
  serialNumber?: string;
}

type UsbNavigator = Navigator & {
  usb?: {
    getDevices: () => Promise<UsbDeviceLike[]>;
    requestDevice: (options: {
      filters: Array<{ classCode?: number }>;
    }) => Promise<UsbDeviceLike>;
  };
};

let activeDevice: UsbDeviceLike | null = null;

export function isWebUsbSupported(): boolean {
  return typeof navigator !== "undefined" && "usb" in navigator;
}

export function getConnectedUsbPrinter(): UsbPrinterDeviceInfo | null {
  if (!activeDevice) return null;
  return toDeviceInfo(activeDevice);
}

export async function listAuthorizedUsbPrinters(): Promise<UsbPrinterDeviceInfo[]> {
  const nav = navigator as UsbNavigator;
  if (!nav.usb) return [];
  const devices = await nav.usb.getDevices();
  return devices.map(toDeviceInfo);
}

export async function connectUsbPrinter(
  device?: UsbDeviceLike,
): Promise<UsbPrinterDeviceInfo> {
  const nav = navigator as UsbNavigator;
  if (!nav.usb) {
    throw new Error("WebUSB is not supported in this browser. Use Chrome or Edge.");
  }

  const selected =
    device ??
    (await nav.usb.requestDevice({
      filters: [{ classCode: 7 }],
    }));

  await openPrinterDevice(selected);
  activeDevice = selected;

  const info = toDeviceInfo(selected);
  updateReceiptPrinterPreferences({
    mode: "raw-escpos",
    usbDeviceLabel: info.label,
    usbVendorId: info.vendorId,
    usbProductId: info.productId,
    usbSerialNumber: info.serialNumber,
  });

  return info;
}

export async function reconnectSavedUsbPrinter(): Promise<UsbPrinterDeviceInfo | null> {
  const prefs = loadPrinterPreferences().receipt;
  if (!prefs.usbVendorId || !prefs.usbProductId) return null;

  const devices = await listAuthorizedUsbPrinters();
  const match = devices.find(
    (device) =>
      device.vendorId === prefs.usbVendorId &&
      device.productId === prefs.usbProductId &&
      (!prefs.usbSerialNumber || device.serialNumber === prefs.usbSerialNumber),
  );
  if (!match) return null;

  const nav = navigator as UsbNavigator;
  const raw = (await nav.usb?.getDevices())?.find(
    (device) =>
      device.vendorId === match.vendorId &&
      device.productId === match.productId &&
      (!match.serialNumber || device.serialNumber === match.serialNumber),
  );
  if (!raw) return null;

  await openPrinterDevice(raw);
  activeDevice = raw;
  return match;
}

export async function disconnectUsbPrinter(): Promise<void> {
  if (activeDevice?.opened) {
    try {
      await activeDevice.close();
    } catch {
      // Device may already be closed.
    }
  }
  activeDevice = null;
}

export async function forgetUsbPrinter(): Promise<void> {
  await disconnectUsbPrinter();
  updateReceiptPrinterPreferences({
    usbDeviceLabel: undefined,
    usbVendorId: undefined,
    usbProductId: undefined,
    usbSerialNumber: undefined,
  });
}

export async function printEscPosToUsb(bytes: Uint8Array): Promise<void> {
  if (!activeDevice?.opened) {
    const reconnected = await reconnectSavedUsbPrinter();
    if (!reconnected) {
      await connectUsbPrinter();
    }
  }
  if (!activeDevice) {
    throw new Error("No USB printer connected.");
  }
  await writeEscPos(activeDevice, bytes);
}

export function buildUsbTestPrint(): Uint8Array {
  return new EscPosEncoder()
    .initialize()
    .align("center")
    .bold(true)
    .line("POS TEST PRINT")
    .bold(false)
    .newline()
    .align("left")
    .line("USB receipt printer connected.")
    .line(new Date().toLocaleString())
    .newline(2)
    .cut()
    .encode();
}

async function openPrinterDevice(device: UsbDeviceLike): Promise<void> {
  if (!device.opened) {
    await device.open();
  }
  if (device.configuration == null) {
    await device.selectConfiguration(1);
  }

  const iface = device.configuration?.interfaces.find((entry) =>
    entry.alternates.some((alt) => alt.interfaceClass === 7),
  );
  if (!iface) {
    throw new Error("No USB printer interface found on this device.");
  }

  await device.claimInterface(iface.interfaceNumber);
}

async function writeEscPos(device: UsbDeviceLike, bytes: Uint8Array): Promise<void> {
  const iface = device.configuration?.interfaces.find((entry) =>
    entry.alternates.some((alt) => alt.interfaceClass === 7),
  );
  if (!iface) {
    throw new Error("Printer interface is unavailable.");
  }

  const alternate =
    iface.alternates.find((alt) => alt.interfaceClass === 7) ?? iface.alternates[0];
  const endpoint = alternate.endpoints.find((ep) => ep.direction === "out");
  if (!endpoint) {
    throw new Error("Printer output endpoint not found.");
  }

  const payload = new Uint8Array(bytes.byteLength);
  payload.set(bytes);
  await device.transferOut(endpoint.endpointNumber, payload);
}

function toDeviceInfo(device: UsbDeviceLike): UsbPrinterDeviceInfo {
  return {
    label: device.productName || device.manufacturerName || "USB thermal printer",
    vendorId: device.vendorId,
    productId: device.productId,
    serialNumber: device.serialNumber || undefined,
  };
}

interface UsbDeviceLike {
  opened: boolean;
  vendorId: number;
  productId: number;
  productName?: string;
  manufacturerName?: string;
  serialNumber?: string;
  open: () => Promise<void>;
  close: () => Promise<void>;
  selectConfiguration: (configurationValue: number) => Promise<void>;
  claimInterface: (interfaceNumber: number) => Promise<void>;
  transferOut: (
    endpointNumber: number,
    data: BufferSource,
  ) => Promise<unknown>;
  configuration: {
    interfaces: Array<{
      interfaceNumber: number;
      alternates: Array<{
        interfaceClass: number;
        endpoints: Array<{
          endpointNumber: number;
          direction: "in" | "out";
        }>;
      }>;
    }>;
  } | null;
}
