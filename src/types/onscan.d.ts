declare module "onscan.js" {
  export interface ScanOptions {
    suffixKeyCodes?: number[];
    prefixKeyCodes?: number[];
    reactToPaste?: boolean;
    minLength?: number;
    avgTimeByChar?: number;
    ignoreIfFocusOn?: boolean | string | HTMLElement;
    stopPropagation?: boolean;
    preventDefault?: boolean;
    onScan?: (code: string, quantity: number) => void;
    onScanError?: (error: unknown) => void;
    keyCodeMapper?: (event: KeyboardEvent) => string | null;
  }

  const onScan: {
    attachTo: (element: Document | HTMLElement, options?: ScanOptions) => void;
    detachFrom: (element: Document | HTMLElement) => void;
    isAttachedTo: (element: Document | HTMLElement) => boolean;
  };

  export default onScan;
}
