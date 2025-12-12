# FlexMode Vercel (Serverless)

This project is structured for Vercel serverless functions.

## Structure
- `public/` - static frontend (index.html, assets)
- `api/` - serverless function endpoints
- `protected-files/` - placeholder PDF (not ideal for Vercel production; use S3)

## Local dev
- Install Vercel CLI: `npm i -g vercel`
- Install deps: `npm install`
- Run: `vercel dev`

## Notes for production
- Vercel has limits on serverless execution and bundle size.
- **Recommended:** Store PDFs in S3 / Cloud Storage and return presigned URLs.
- If using `protected-files/`, ensure files are small and within Vercel limits.

## Environment
Copy `.env.example` to `.env` and fill Razorpay keys and optional email creds.

## Endpoints
- `GET /api/health` - health check
- `POST /api/create-order`
- `POST /api/verify-payment`
- `GET /api/download/:token`

## Security
- Use Razorpay webhooks for reconciliation in production.
- Use Redis for token store instead of in-memory map.
