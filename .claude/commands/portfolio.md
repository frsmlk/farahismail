Manage Farah's portfolio via the kontekstkl API. Read the full instructions at `agent/INSTRUCTIONS.md`.

## Quick reference

- **Base URL**: https://www.farahismail.com (or http://localhost:3000 for local dev). Always use `www` — bare domain redirects and strips auth.
- **Auth header**: `Authorization: Bearer pokitoipon`

## Steps

1. First, call `GET /api/agent/context` to see what's in the portfolio:
```bash
curl -s -H "Authorization: Bearer pokitoipon" "${BASE_URL:-http://localhost:3000}/api/agent/context" | head -200
```

2. Based on user input, determine what actions to take. Available operations:

| Action | Method | Endpoint |
|--------|--------|----------|
| Search | GET | /api/search?q={query} |
| List all entries | GET | /api/entries |
| Get entry | GET | /api/entries/{slug} |
| Create entry | POST | /api/entries |
| Update entry | PATCH | /api/entries/{slug} |
| Delete entry | DELETE | /api/entries/{slug} |
| Add timeline update | POST | /api/entries/{slug}/updates |
| Get updates | GET | /api/entries/{slug}/updates |
| Add media | POST | /api/entries/{slug}/media |
| Get media | GET | /api/entries/{slug}/media |
| Upload file | POST | /api/upload |
| Get profile | GET | /api/profile |
| Update profile | PATCH | /api/profile |

3. Execute the API calls using curl or fetch. Always include the auth header.

4. Report back to the user what was done.

## Rules

- Use `search` when the user mentions a project by partial name.
- Use today's date for timeline updates unless told otherwise.
- Timeline update types: `milestone` (achievements), `note` (observations), `photo` (visual), `thought` (reflections).
- Write timeline text in first person, Farah's voice — specific, reflective, grounded in place and material.
- **Never delete without explicit confirmation.**
- Categories: Residential, Urban Planning, Interior Design, Art Direction, Modelling, Artworks, Hospitality, Set Design, Furniture, Landscape.
- Entry types: project, job, education, milestone.
- Status: complete, ongoing, paused.
- Generate slugs from titles: lowercase, hyphens, no special chars.
- **File uploads**: POST /api/upload (multipart or JSON with base64). Get the URL back, then POST /api/entries/{slug}/media to attach it.
