declare module "react-signature-canvas" {
  import * as React from "react";
  import type SignaturePad from "signature_pad";

  interface ReactSignatureCanvasProps {
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
    clearOnResize?: boolean;
    dotSize?: number | (() => number);
    throttle?: number;
    minWidth?: number;
    maxWidth?: number;
    minDistance?: number;
    velocityFilterWeight?: number;
    backgroundColor?: string;
    penColor?: string;
    onBegin?: () => void;
    onEnd?: () => void;
  }

  export default class SignatureCanvas extends React.Component<
    ReactSignatureCanvasProps
  > {
    getCanvas(): HTMLCanvasElement;
    getTrimmedCanvas(): HTMLCanvasElement;
    getSignaturePad(): SignaturePad;
    clear(): void;
    isEmpty(): boolean;
    fromDataURL(base64String: string, options?: Record<string, unknown>): void;
  }
}
