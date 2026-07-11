# Mewtual

## Workflow Constraints

These are hard rules. They override any "quick check" or "just to verify" rationale.

- **Never run linters or formatters.** Do not run `eslint`, `prettier`, etc. The developer handles all lint and formatting manually. (`tsc --noEmit` for type-checking only is fine.)
- **Never start the application.** Do not run the dev server or anything that boots the app (`npm run dev`, `npm start`, `vite`, `next dev`). The developer performs all visual and integration checks.
- **Never run a build to verify.** Do not run `npm run build` or equivalent to validate changes unless explicitly asked.

## Styling & Components

This project uses **shadcn/ui** with **semantic color tokens**. The bundled `shadcn` skill (`.agents/skills/shadcn/`) is the source of truth and is enforced automatically during UI work. In short:

- Use semantic tokens (`bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `bg-destructive`, …) — **never** hard-coded colors (`#fff`, `blue-500`, `rgb(...)`). If a raw value is genuinely required (e.g. a chart), add a comment explaining why.
- Use shadcn/ui components instead of hand-rolling UI primitives. If a component isn't in the project yet, add it via the CLI (`npx shadcn@latest add <component>`) before writing custom code.
- For requirements beyond a single component, compose shadcn primitives (e.g. a `DateRangePicker` built on `<Calendar>` + `<Popover>`) rather than raw HTML or third-party libraries.

See `.agents/skills/shadcn/rules/` for the full styling and composition rules.

## General Code Quality

- Prefer explicit, readable code over clever one-liners.
- Keep components small and single-responsibility.
- Avoid unnecessary dependencies.
- When in doubt, ask before making large structural changes.
