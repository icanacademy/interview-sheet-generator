# Notion Proxy Server

This proxy server handles requests to the Notion API to avoid CORS issues in the browser.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

## Endpoints

- `GET /health` - Health check
- `GET /api/students` - Fetch students from Notion database

## Configuration

The server is configured with:
- **Notion API Key**: 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
- **Database ID**: 1abd37d666308071bfe1e37d1d155035

## Usage

1. Start the proxy server (this terminal)
2. Open the interview sheet generator (index.html) in your browser
3. The dropdown will automatically populate with students from your Notion database

## Troubleshooting

If students don't load:
1. Check that the server is running
2. Check the browser console for errors
3. Visit http://localhost:3000/health to verify the server is responding
4. Make sure your Notion integration has access to the database
