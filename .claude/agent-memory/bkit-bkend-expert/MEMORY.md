# bkend-expert Agent Memory

## Critical: API Base URL Correction

The bkit skill template uses the WRONG base URL. The correct base URL verified from live docs is:

```
https://api-client.bkend.ai/v1
```

NOT `https://api.bkend.ai/v1` (that URL is only for MCP, not Service API).

## Critical: Auth Header Correction

Service API uses `X-API-Key` header with a Publishable Key (prefix `pk_`).
There is NO `x-project-id` or `x-environment` header in the Service API.

```
X-API-Key: pk_your_publishable_key
Authorization: Bearer {accessToken}   # only for protected endpoints after login
```

## Signup Request Body Format

The `method` field is REQUIRED. Signup also requires `name`.

```json
{
  "method": "password",
  "email": "user@example.com",
  "password": "MyP@ssw0rd!",
  "name": "Display Name"
}
```

## Required Environment Variables (.env.local)

```
NEXT_PUBLIC_BKEND_API_URL=https://api-client.bkend.ai/v1
NEXT_PUBLIC_BKEND_PUBLISHABLE_KEY=pk_your_key_here
```

Publishable Key is found in bkend console (console.bkend.ai) under project settings.

## Source Verified

All above facts verified from: `ko/authentication/19-api-reference.md` and `ko/authentication/03-email-signin.md` in the bkend-docs GitHub repo (2026-02-20).

## MCP vs Service API

- MCP endpoint: `https://api.bkend.ai/mcp` (for Claude Code tool management)
- Service API: `https://api-client.bkend.ai/v1` (for app REST calls)
- These are different URLs with different auth mechanisms
