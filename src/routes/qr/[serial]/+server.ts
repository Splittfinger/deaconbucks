import qrcode from 'qrcode-generator';

export function GET({ params, url }) {
  const serial = params.serial.trim().toUpperCase();
  const depositUrl = `${url.origin}/deposit?serial=${encodeURIComponent(serial)}`;
  const qr = qrcode(0, 'M');
  qr.addData(depositUrl);
  qr.make();
  const svg = qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true });

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
