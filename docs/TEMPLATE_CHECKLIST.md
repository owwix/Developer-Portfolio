# Template Checklist

Use this checklist before publishing this repository as a reusable template.

## 1) Branding and identity

- Set `.env` values:
  - `SITE_URL`
  - `SITE_OWNER_NAME`
  - `SITE_OWNER_ROLE`
  - `SITE_BLOG_LABEL`
  - `CMS_TITLE`
  - `CMS_SUBTITLE`
  - `CMS_MONOGRAM`
- In Payload admin, update:
  - `Globals -> Homepage Content`
  - `Globals -> Admin Branding`

## 2) Content cleanup

- Remove personal/demo notes, projects, and experiences.
- Keep 1-2 generic sample records for onboarding.
- Confirm no personal email, phone, or private links remain.

## 3) Infrastructure

- Create a new MongoDB database for each new template user.
- Set `PAYLOAD_SECRET` to a unique secure value.
- Configure media persistence in production (`PAYLOAD_MEDIA_DIR` volume).

## 4) Deployment

- Set environment variables in Railway/Vercel.
- Run:
  - `npm run build`
  - `npm start`
- Verify:
  - `/`
  - `/blog`
  - `/blog/[slug]`
  - `/admin`

## 5) Optional versioning strategy

- Tag starter release as `v0.1.0-template`.
- Keep template updates in changelog.
- Add migration notes when schema changes.
