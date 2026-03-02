# CSS Dependency Map

This map reflects the current structure after moving derived math into `@theme`.

Files:

- `src/styles/globals.css`
- `src/styles/tokens.css`
- `src/styles/theme.css`
- `src/styles/utilities.css`
- `src/styles/components.css`

## 1) Layer Order

`globals.css` loads in this order:

1. `tailwindcss`
2. `@custom-variant dark`
3. `tw-animate-css`
4. `tokens.css`
5. `theme.css`
6. `utilities.css`
7. `components.css`

Implication:

- `tokens.css` defines base inputs.
- `theme.css` derives semantic/theme API from token inputs.
- `utilities.css` and `components.css` consume semantic variables.

## 2) Responsibilities

### `tokens.css` (source inputs)

Defines:

- Shadcn color tokens and dark overrides:
  - `--background`, `--foreground`, `--muted`, `--card`, `--primary`, etc.
- Primitive design inputs (`--wr-*`):
  - `--wr-gap-base`, `--wr-gap-scale`
  - `--wr-radius-base`, `--wr-hairline`
  - `--wr-padding-site-gutter`, `--wr-padding-contour`
  - `--wr-height-header-content`, `--wr-height-page`
  - `--wr-width-site`, `--wr-width-prose`
  - `--wr-text-size-base`, `--wr-text-scale`
- Responsive overrides for primitives:
  - `--wr-gap-scale` at 450px and 850px
  - `--wr-padding-site-gutter` at 450px
  - text base/scale at 450px and 850px

### `theme.css` (derived + semantic API)

Defines via `@theme`:

- Breakpoints (`--breakpoint-*`)
- Tailwind colors (`--color-*`) derived from base color tokens
- Derived spacing/gap (`--gap-*`, `--spacing-*`)
- Derived padding (`--padding-*`)
- Derived size/layout (`--width-*`, `--height-*`, `--site-layout`)
- Derived radius (`--radius*`)
- Derived typography scale (`--text-size-*`)
- Shadow/animation variables (`--shadow-contour`, `--animate-*`)

### `utilities.css` (custom utilities/keyframes)

Consumes:

- `--site-layout`
- `--height-header`

Defines:

- `grid-cols-siteLayout`
- `min-h-svh-minus-header`
- `accordion-down/up` keyframes

### `components.css` (component-level CSS)

Consumes semantic vars:

- Area/layout: `--area`, `--radius-area`, `--padding-area`, `--width-prose`, `--height-header-content`
- Spacing: `--gap-*`
- Typography: `--text-size-*`

## 3) Main Dependency Chains

### Color chain

`tokens.css` color tokens
-> `theme.css` `--color-*`
-> Tailwind color utilities (`bg-background`, `text-foreground`, etc.) and direct `hsl(var(--area))` usage

### Gap/padding/height chain

`tokens.css` primitives (`--wr-gap-base`, `--wr-gap-scale`, etc.)
-> `theme.css` derived vars (`--gap-*`, `--padding-*`, `--height-*`)
-> utilities (`grid-cols-siteLayout`, `min-h-svh-minus-header`) + Tailwind classes (`gap-*`, `p-*`, `h-*`)

### Radius chain

`--wr-radius-base`
-> `theme.css` `--radius*` / `--radius-area*`
-> Tailwind `rounded-*` + `.area` styles

### Typography chain

`--wr-text-size-base`, `--wr-text-scale`
-> `theme.css` `--text-size-*`
-> `components.css` prose/heading/ui classes

## 4) Current Semantics (what to treat as API)

App-facing semantic API should be considered to live in `theme.css`:

- `--color-*`
- `--gap-*`
- `--spacing-*`
- `--padding-*`
- `--width-*`
- `--height-*`
- `--radius*`
- `--text-size-*`
- `--site-layout`

`tokens.css` should remain the primitive/input layer.

## 5) Practical Rule for Future Changes

- If changing visual scale/brand/system inputs: edit `tokens.css` primitives.
- If changing semantic mapping or calculated outputs consumed by classes: edit `theme.css`.
- If introducing component-specific CSS behavior: edit `components.css`.
- If introducing new reusable Tailwind-style utility: edit `utilities.css`.
