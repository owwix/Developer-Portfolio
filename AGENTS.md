# Codex Instructions

- Treat `education` as a first-class portfolio section, not an ad hoc text block.
- Keep these files in sync when changing homepage sections: `src/globals/Home.ts`, `app/page.tsx`, `lib/cms.ts`, and `src/payload.config.ts`.
- `education` content must stay editable in Payload via the `education` collection.
- Visibility for `education` must remain configurable in both `sectionVisibility` and `resumeSectionVisibility`.
- Resume mode is controlled by `?mode=resume`, `?view=resume`, or `?resume=true`; section changes must respect that path.
- If a future change adds or removes portfolio sections, update README collection docs as well.
