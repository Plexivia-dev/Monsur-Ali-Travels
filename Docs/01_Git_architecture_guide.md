# Git Architecture Guide & Commit Conventions

## Strict Commit Message Rule

Every single Git commit message **MUST start with the exact Log ID(s)** from `Docs/Backend/MB01-100.md` or `Docs/Dashboard/MD01-100.md`.

### Format:
```bash
git commit -m "<LOG_ID>: <brief summary of changes>"
```

### Examples:
- Backend only: `git commit -m "MB20: implement passport submission stage workflow and tracking API"`
- Dashboard only: `git commit -m "MD97: add stage switcher modal to passport submissions data table"`
- Fullstack (both): `git commit -m "MB20 & MD97: add stage tracking and document attachment to passport submissions"`

