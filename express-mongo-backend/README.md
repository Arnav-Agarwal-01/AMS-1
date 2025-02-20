# Asset Management System Backend

This is the backend service for the Asset Management System. It provides RESTful APIs for managing assets.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with:
```
PORT=5001
MONGO_URI=mongodb://localhost:27017/asset-management
```

3. Start the server:
```bash
npm run dev
```

## API Endpoints

- `GET /assets` - Fetch all assets
- `POST /assets/add` - Add a new asset
- `DELETE /assets/delete/:id` - Delete an asset
- `GET /assets/deleted` - Fetch deleted assets
- `PUT /assets/update-quantity/:id` - Update asset quantity
- `PUT /assets/maintenance/:id` - Mark asset as damaged
