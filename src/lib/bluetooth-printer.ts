import { EscPosEncoder } from "@/core/application/print/EscPosEncoder";
import { updateReceiptPrinterPreferences } from "@/lib/printer-preferences";

export interface BluetoothPrinterDeviceInfo {
  id: string;
  label: string;
}

type BluetoothNavigator = Navigator & {
  bluetooth?: {
    requestDevice: (options: {
      acceptAllDevices?: boolean;
      filters?: Array<{ services?: string[]; namePrefix?: string }>;
      optionalServices?: string[];
    }) => Promise<BluetoothDeviceLike>;
  };
};

interface BluetoothDeviceLike {
  id: string;
  name?: string;
  gatt?: {
    connected: boolean;
    connect: () => Promise<BluetoothRemoteGATTServerLike>;
    disconnect: () => void;
  };
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

interface BluetoothRemoteGATTServerLike {
  connected: boolean;
  getPrimaryServices: () => Promise<BluetoothRemoteGATTServiceLike[]>;
}

interface BluetoothRemoteGATTServiceLike {
  getCharacteristics: () => Promise<BluetoothRemoteGATTCharacteristicLike[]>;
}

interface BluetoothRemoteGATTCharacteristicLike {
  properties: {
    write?: boolean;
    writeWithoutResponse?: boolean;
  };
  writeValue: (value: BufferSource) => Promise<void>;
  writeValueWithoutResponse?: (value: BufferSource) => Promise<void>;
}

const BLE_PRINTER_SERVICES: string[] = [
  "000018f0-0000-1000-8000-00805f9b34fb",
  "18f0",
  "0000ff00-0000-1000-8000-00805f9b34fb",
  "ff00",
  "0000ae30-0000-1000-8000-00805f9b34fb",
  "ae30",
  "0000fff0-0000-1000-8000-00805f9b34fb",
  "fff0",
  "49535343-fe7d-4ae5-8fa9-9fafd205e455",
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
  "0000ffe0-0000-1000-8000-00805f9b34fb",
  "ffe0",
];

const CHUNK_SIZE = 20;

let activeDevice: BluetoothDeviceLike | null = null;
let activeCharacteristic: BluetoothRemoteGATTCharacteristicLike | null = null;
let disconnectListener: (() => void) | null = null;

export function isWebBluetoothSupported(): boolean {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}

export function getConnectedBluetoothPrinter(): BluetoothPrinterDeviceInfo | null {
  if (!activeDevice || !activeCharacteristic) return null;
  return toDeviceInfo(activeDevice);
}

export async function connectBluetoothPrinter(): Promise<BluetoothPrinterDeviceInfo> {
  const nav = navigator as BluetoothNavigator;
  if (!nav.bluetooth) {
    throw new Error(
      "Web Bluetooth is not supported in this browser. Use Chrome or Edge on HTTPS or localhost.",
    );
  }

  const device = await nav.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: BLE_PRINTER_SERVICES,
  });

  if (!device.gatt) {
    throw new Error("This Bluetooth device does not expose a GATT printer connection.");
  }

  const server = await device.gatt.connect();
  const characteristic = await findWritableCharacteristic(server);

  bindDevice(device, characteristic);

  const info = toDeviceInfo(device);
  updateReceiptPrinterPreferences({
    mode: "raw-escpos",
    transport: "bluetooth",
    bluetoothDeviceId: info.id,
    bluetoothDeviceLabel: info.label,
  });
  return info;
}

export async function disconnectBluetoothPrinter(): Promise<void> {
  unbindDevice();
}

export async function forgetBluetoothPrinter(): Promise<void> {
  await disconnectBluetoothPrinter();
  updateReceiptPrinterPreferences({
    bluetoothDeviceId: undefined,
    bluetoothDeviceLabel: undefined,
  });
}

export async function printEscPosToBluetooth(bytes: Uint8Array): Promise<void> {
  if (!activeCharacteristic) {
    throw new Error("No Bluetooth printer connected. Pair it from Printer setup first.");
  }
  await writeInChunks(activeCharacteristic, bytes);
}

export function buildBluetoothTestPrint(): Uint8Array {
  return new EscPosEncoder()
    .initialize()
    .align("center")
    .bold(true)
    .line("POS TEST PRINT")
    .bold(false)
    .newline()
    .align("left")
    .line("Bluetooth receipt printer connected.")
    .line(new Date().toLocaleString())
    .newline(2)
    .cut()
    .encode();
}

function bindDevice(
  device: BluetoothDeviceLike,
  characteristic: BluetoothRemoteGATTCharacteristicLike,
) {
  unbindDevice();
  activeDevice = device;
  activeCharacteristic = characteristic;
  disconnectListener = () => {
    activeDevice = null;
    activeCharacteristic = null;
  };
  device.addEventListener("gattserverdisconnected", disconnectListener);
}

function unbindDevice() {
  if (activeDevice && disconnectListener) {
    activeDevice.removeEventListener("gattserverdisconnected", disconnectListener);
  }
  try {
    activeDevice?.gatt?.disconnect();
  } catch {
    // Already disconnected.
  }
  activeDevice = null;
  activeCharacteristic = null;
  disconnectListener = null;
}

async function findWritableCharacteristic(
  server: BluetoothRemoteGATTServerLike,
): Promise<BluetoothRemoteGATTCharacteristicLike> {
  const services = await server.getPrimaryServices();
  for (const service of services) {
    const characteristics = await service.getCharacteristics();
    const writable = characteristics.find(
      (item) => item.properties.writeWithoutResponse || item.properties.write,
    );
    if (writable) return writable;
  }
  throw new Error(
    "No writable Bluetooth printer characteristic found. Classic Bluetooth (SPP) printers cannot be used from a browser — use a BLE thermal printer, USB, or Wi‑Fi HTTP.",
  );
}

async function writeInChunks(
  characteristic: BluetoothRemoteGATTCharacteristicLike,
  bytes: Uint8Array,
): Promise<void> {
  for (let offset = 0; offset < bytes.byteLength; offset += CHUNK_SIZE) {
    const slice = bytes.slice(offset, offset + CHUNK_SIZE);
    const payload = new Uint8Array(slice);
    if (characteristic.writeValueWithoutResponse) {
      await characteristic.writeValueWithoutResponse(payload);
    } else {
      await characteristic.writeValue(payload);
    }
  }
}

function toDeviceInfo(device: BluetoothDeviceLike): BluetoothPrinterDeviceInfo {
  return {
    id: device.id,
    label: device.name || "Bluetooth thermal printer",
  };
}
