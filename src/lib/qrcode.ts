import QRCode from 'qrcode'

export async function generateQRCode(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 80,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' },
  })
}
