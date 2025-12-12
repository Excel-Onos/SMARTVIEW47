```markdown
# File Share MVP

This is a minimal MVP that lets an admin upload files and users download/preview them.

Run:
1. npm install
2. Create a .env.local (example provided)
3. npm run dev
4. Open http://localhost:3000

Admin login requires password: EEOIC201014SS1 (demo only). In production use a secure password store.

Features:
- Admin-only upload page (Admin Centre)
- Public file listing and preview (images, video, PDF). ZIP contents are listed server-side.
- Files stored in storage/ and metadata in data/files.json

Important security notes:
- Don't commit .env.local or secrets to source control.
- Add virus scanning, file size limits, proper auth, HTTPS, CSP, rate-limiting for production.
```