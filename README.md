# SMSPro — Enterprise Messaging Platform

A full-stack SMS platform with dual-provider routing, credit management, and bulk messaging.

## Stack
- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MySQL
- **SMS Providers**: Twilio (international) + MSG91 (India)

## Project Structure
```
sms-pro/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── context/ # Auth + Toast context
│       ├── pages/   # All route pages
│       ├── components/
│       └── services/api.js
└── server/          # Express backend
    └── src/
        ├── controllers/
        ├── routes/
        ├── services/
        ├── middleware/
        ├── config/
        └── utils/
```

## Setup

### 1. Database
```sql
-- Run schema.sql in MySQL
mysql -u root -p < server/schema.sql
```

### 2. Server
```bash
cd server
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

### 3. Client
```bash
cd client
cp .env.example .env
# Set VITE_API_URL if needed
npm install
npm run dev
```

## Environment Variables (server/.env)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `JWT_SECRET` | Strong random secret for JWT |
| `DB_HOST` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL connection |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Your Twilio number |
| `TWILIO_STATUS_CALLBACK_URL` | Webhook URL for delivery status |
| `MSG91_AUTH_KEY` | MSG91 auth key |
| `MSG91_TEMPLATE_ID` | MSG91 template ID |

## SMS Routing Logic
- **India** (`+91` or country = "India") → **MSG91**
- **All other countries** → **Twilio**

## Features
- JWT authentication with role-based access (user / admin)
- Credit system — 1 credit per SMS, transactional with row-locking
- Single SMS send + bulk CSV/Excel upload
- Message history with pagination and search
- Admin panel: user management, credit top-up, activate/suspend, full SMS logs
- Delivery status webhooks from both providers
- Real-time credit balance updates
- Responsive sidebar layout

## Bulk Upload Format
Your CSV/Excel file should have these columns:

| Column | Required | Notes |
|---|---|---|
| `recipient_number` | ✅ | Include country code e.g. +919876543210 |
| `message_text` | Optional | Default message used if empty |
| `country` | Optional | Defaults to India |

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/auth/profile` *(auth)*

### SMS
- `POST /api/sms/send` *(auth)*
- `POST /api/sms/bulk-send` *(auth, multipart)*
- `GET  /api/sms/my-messages` *(auth, ?page=1&limit=20)*
- `GET  /api/sms/stats` *(auth)*

### Admin
- `GET  /api/admin/users` *(admin)*
- `GET  /api/admin/sms-logs` *(admin)*
- `GET  /api/admin/stats` *(admin)*
- `POST /api/admin/credits` *(admin)*
- `POST /api/admin/user-status` *(admin)*

### Webhooks
- `POST /api/webhooks/twilio/status`
- `POST /api/webhooks/msg91/status`
