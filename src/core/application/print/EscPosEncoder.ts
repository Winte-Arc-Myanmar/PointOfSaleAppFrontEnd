/**
 * Minimal ESC/POS command encoder for common thermal receipt printers.
 * Compatible with Epson-compatible ESC/POS devices (58mm / 80mm).
 */

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

export class EscPosEncoder {
  private readonly chunks: number[] = [];

  initialize(): this {
    this.chunks.push(ESC, 0x40);
    return this;
  }

  align(alignment: "left" | "center" | "right"): this {
    const value = alignment === "center" ? 1 : alignment === "right" ? 2 : 0;
    this.chunks.push(ESC, 0x61, value);
    return this;
  }

  bold(enabled: boolean): this {
    this.chunks.push(ESC, 0x45, enabled ? 1 : 0);
    return this;
  }

  size(width: 1 | 2, height: 1 | 2): this {
    const n = ((height - 1) << 4) | (width - 1);
    this.chunks.push(GS, 0x21, n);
    return this;
  }

  text(value: string): this {
    for (let i = 0; i < value.length; i++) {
      const code = value.charCodeAt(i);
      this.chunks.push(code <= 0xff ? code : 0x3f);
    }
    return this;
  }

  newline(count = 1): this {
    for (let i = 0; i < count; i++) this.chunks.push(LF);
    return this;
  }

  line(value = ""): this {
    if (value) this.text(value);
    return this.newline();
  }

  separator(char = "-", width = 32): this {
    return this.line(char.repeat(width));
  }

  cut(partial = false): this {
    this.chunks.push(GS, 0x56, partial ? 1 : 0);
    return this;
  }

  encode(): Uint8Array {
    return Uint8Array.from(this.chunks);
  }
}

/** Characters that fit on one line for common paper widths. */
export function charsPerLine(paperWidthMm: 58 | 80): number {
  return paperWidthMm === 58 ? 32 : 42;
}

export function padLine(
  left: string,
  right: string,
  width: number,
): string {
  const gap = Math.max(1, width - left.length - right.length);
  return `${left}${" ".repeat(gap)}${right}`.slice(0, width);
}

export function wrapText(text: string, width: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (!current) {
      current = word.slice(0, width);
      continue;
    }
    if (`${current} ${word}`.length <= width) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word.slice(0, width);
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function money(n: number): string {
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}
