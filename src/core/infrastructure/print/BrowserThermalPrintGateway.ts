import type {
  ThermalPrintOptions,
  ThermalPrintResult,
} from "@/core/domain/entities/ThermalPrint";
import type { IThermalPrintGateway } from "@/core/domain/repositories/IThermalPrintGateway";

/**
 * Browser-side thermal print transport.
 *
 * - browser mode: opens a thermal-sized HTML document and triggers the print dialog
 *   (works with USB thermal printers that expose a Windows/macOS print driver).
 * - raw-escpos mode: downloads an .bin ESC/POS file for use with a local print
 *   agent / raw TCP bridge (e.g. kitchen printer on port 9100).
 *
 * Direct TCP to KitchenPrinter IP:9100 is not possible from the browser sandbox;
 * that path requires a backend or local agent.
 */
export class BrowserThermalPrintGateway implements IThermalPrintGateway {
  async printHtml(
    html: string,
    options: Required<ThermalPrintOptions>,
  ): Promise<ThermalPrintResult> {
    if (typeof window === "undefined") {
      return {
        success: false,
        mode: "browser",
        message: "Thermal printing is only available in the browser.",
      };
    }

    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    frame.style.visibility = "hidden";
    document.body.appendChild(frame);

    const doc = frame.contentDocument ?? frame.contentWindow?.document;
    if (!doc) {
      frame.remove();
      return {
        success: false,
        mode: "browser",
        message: "Unable to open thermal print frame.",
      };
    }

    doc.open();
    doc.write(html);
    doc.close();

    await new Promise<void>((resolve) => {
      const done = () => resolve();
      if (frame.contentDocument?.readyState === "complete") {
        done();
        return;
      }
      frame.onload = () => done();
      // Fallback if onload is missed
      window.setTimeout(done, 250);
    });

    try {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      return {
        success: true,
        mode: "browser",
        message: `Sent to thermal printer dialog (${options.paperWidthMm}mm).`,
      };
    } catch (error) {
      return {
        success: false,
        mode: "browser",
        message:
          error instanceof Error
            ? error.message
            : "Failed to open print dialog.",
      };
    } finally {
      window.setTimeout(() => frame.remove(), 1000);
    }
  }

  async printEscPos(
    bytes: Uint8Array,
    _options: Required<ThermalPrintOptions>,
  ): Promise<ThermalPrintResult> {
    if (typeof window === "undefined") {
      return {
        success: false,
        mode: "raw-escpos",
        rawBytes: bytes,
        message: "Raw ESC/POS export is only available in the browser.",
      };
    }

    // Prefer WebUSB when the browser and printer support it.
    const usbResult = await this.tryWebUsb(bytes);
    if (usbResult) return usbResult;

    // Fallback: download raw ESC/POS bytes for a local agent / raw print utility.
    const payload = copyBytes(bytes);
    const blob = new Blob([payload], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `receipt-${Date.now()}.bin`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    return {
      success: true,
      mode: "raw-escpos",
      rawBytes: bytes,
      message:
        "Downloaded ESC/POS file. Send it to your thermal printer via a local print agent (TCP 9100) or raw printer utility.",
    };
  }

  private async tryWebUsb(
    bytes: Uint8Array,
  ): Promise<ThermalPrintResult | null> {
    const nav = navigator as Navigator & {
      usb?: {
        requestDevice: (options: {
          filters: Array<{ classCode?: number }>;
        }) => Promise<UsbDeviceLike>;
      };
    };

    if (!nav.usb) return null;

    try {
      const device = await nav.usb.requestDevice({
        filters: [{ classCode: 7 }], // USB printer class
      });
      await device.open();
      if (device.configuration == null) {
        await device.selectConfiguration(1);
      }

      const iface = device.configuration?.interfaces.find((entry) =>
        entry.alternates.some((alt) => alt.interfaceClass === 7),
      );
      if (!iface) {
        await device.close();
        return null;
      }

      await device.claimInterface(iface.interfaceNumber);
      const alternate =
        iface.alternates.find((alt) => alt.interfaceClass === 7) ??
        iface.alternates[0];
      const endpoint = alternate.endpoints.find(
        (ep) => ep.direction === "out",
      );
      if (!endpoint) {
        await device.releaseInterface(iface.interfaceNumber);
        await device.close();
        return null;
      }

      await device.transferOut(endpoint.endpointNumber, copyBytes(bytes));
      await device.releaseInterface(iface.interfaceNumber);
      await device.close();

      return {
        success: true,
        mode: "raw-escpos",
        rawBytes: bytes,
        message: "Printed via WebUSB ESC/POS.",
      };
    } catch {
      // User cancelled device picker or device is unsupported — fall through.
      return null;
    }
  }
}

function copyBytes(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy;
}

interface UsbDeviceLike {
  open: () => Promise<void>;
  close: () => Promise<void>;
  selectConfiguration: (configurationValue: number) => Promise<void>;
  claimInterface: (interfaceNumber: number) => Promise<void>;
  releaseInterface: (interfaceNumber: number) => Promise<void>;
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
