export default function handler(_req: any, res: any) {
  return res.status(200).json({
    success: true,
    service: 'Kaise GIF API',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
}
