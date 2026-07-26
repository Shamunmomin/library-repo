import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '../../hooks/useTheme';

interface UpiQrCodeProps {
  upiId: string;
  amount?: number;
  name?: string;
}

export function UpiQrCode({ upiId, amount, name }: UpiQrCodeProps) {
  const { colors } = useTheme();

  const upiUrl = [
    'upi://pay',
    `pa=${upiId}`,
    name ? `pn=${encodeURIComponent(name)}` : 'pn=Library%20Management',
    amount ? `am=${amount}` : null,
    'cu=INR',
  ]
    .filter(Boolean)
    .join('&');

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${colors.card.bg} p-4 rounded-lg border ${colors.border.primary}`}>
        <QRCodeSVG
          value={upiUrl}
          size={180}
          bgColor="white"
          fgColor="#000000"
          level="M"
          includeMargin={false}
        />
      </div>
      <div className="text-center">
        <p className={`text-xs ${colors.text.tertiary}`}>Scan to pay via UPI</p>
        <p className={`text-sm font-medium ${colors.text.primary} mt-1`}>{upiId}</p>
      </div>
    </div>
  );
}
