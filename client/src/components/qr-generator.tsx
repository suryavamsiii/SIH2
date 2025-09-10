import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface QRGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRGenerator({ value, size = 128, className = "" }: QRGeneratorProps) {
  const downloadQR = () => {
    const svg = document.querySelector('.qr-code-svg') as SVGElement;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = size;
      canvas.height = size;
      
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        
        const downloadLink = document.createElement('a');
        downloadLink.download = 'student-qr-code.png';
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <div className={`text-center ${className}`}>
      <div className="inline-block p-4 bg-white rounded-lg border border-border">
        <QRCodeSVG
          value={value}
          size={size}
          className="qr-code-svg"
          data-testid="qr-code"
        />
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={downloadQR}
        className="mt-2 text-primary hover:text-primary/80"
        data-testid="button-download-qr"
      >
        <Download className="w-4 h-4 mr-1" />
        Download QR
      </Button>
    </div>
  );
}
