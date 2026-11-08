# SEENIT Report Submission

Report creation requires a signed-in user. Public listings and details remain readable, while create, edit, and delete operations use the account ID from the verified session cookie (never a client-provided `userId`).

## Photo uploads

Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `server/.env` to enable uploads. Images are sent from the browser as multipart form data and stored in the `seenit/items` Cloudinary folder. The API accepts at most five JPEG, PNG, or WebP images, up to 5 MB each. Without Cloudinary configuration, text-only reports still work; a request containing photos returns a configuration error.

## Report API

- `GET /api/items` and `GET /api/items/:id` are public and do not expose reporter contact methods.
- `POST /api/items` requires authentication; accepts `type`, `name`, `categoryId`, `description`, `itemDate`, `contactMethod`, a JSON `location` field, and optional `images` file fields.
- `PUT /api/items/:id` requires authentication and only edits the current user's report. Send all report fields; attached new images replace existing images.
- `DELETE /api/items/:id` requires authentication and only deletes the current user's report.

The report forms submit to the API, and the Explore page displays API listings instead of the placeholder cards. Location search/map selection is reserved for Phase 6.

## Test and run

From the repository root:

```bash
npm install
npm test --workspace server
npm run dev
```

Initialize MySQL with `server/database/schema.sql`, configure `server/.env`, and set the Cloudinary credentials if testing photos. Register or log in before submitting a report. Confirm the new report appears on `/explore`.
