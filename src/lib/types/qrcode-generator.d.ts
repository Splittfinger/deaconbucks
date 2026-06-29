declare module 'qrcode-generator' {
  export default function qrcode(
    typeNumber: number,
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
  ): {
    addData(data: string): void;
    make(): void;
    createSvgTag(options?: { cellSize?: number; margin?: number; scalable?: boolean }): string;
  };
}
