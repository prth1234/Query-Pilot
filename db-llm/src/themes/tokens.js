/**
 * Shared token contract for every Query Pilot app theme.
 *
 * MODULAR: each file in this folder exports ONE theme with the exact same
 * shape — { id, name, description, primerMode, editorTheme, tokens }.
 * To add a theme: copy any theme file, change the values, import + register
 * it in ./index.js. No CSS edits needed — tokens are applied at runtime.
 */

/** Every key a theme must provide. Applied as CSS vars on <html>. */
export const TOKEN_KEYS = [
  '--bg-canvas',
  '--bg-canvas-subtle',
  '--bg-canvas-inset',
  '--bg-overlay',
  '--bg-card',

  '--fg-default',
  '--fg-muted',
  '--fg-subtle',
  '--fg-on-emphasis',

  '--border-default',
  '--border-muted',
  '--border-subtle',

  '--accent-fg', // primary
  '--accent-emphasis',
  '--accent-muted',

  '--accent-secondary', // secondary
  '--accent-secondary-muted',

  '--accent-tertiary', // tertiary
  '--accent-tertiary-muted',

  '--success-fg',
  '--success-emphasis',
  '--success-muted',

  '--danger-fg',
  '--danger-emphasis',
  '--danger-muted',

  '--shadow-large',
  '--shadow-medium',

  '--syntax-comment',
  '--syntax-entity',
  '--syntax-keyword',
  '--syntax-string',
  '--syntax-variable',
  '--syntax-constant',
]

/** Customizable accent roles exposed in the Theme Settings picker. */
export const CUSTOM_ROLES = [
  {
    role: 'primary',
    label: 'Primary',
    hint: 'Links, active states',
    vars: { fg: '--accent-fg', emphasis: '--accent-emphasis', muted: '--accent-muted' },
  },
  {
    role: 'secondary',
    label: 'Secondary',
    hint: 'Save buttons, highlights',
    vars: { fg: '--accent-secondary', muted: '--accent-secondary-muted' },
  },
  {
    role: 'tertiary',
    label: 'Tertiary',
    hint: 'Query Pilot badge, glow',
    vars: { fg: '--accent-tertiary', muted: '--accent-tertiary-muted' },
  },
]

/** Apply a token map as inline CSS vars (inline wins over stylesheets). */
export function applyTokens(tokens) {
  const root = document.documentElement
  for (const key of TOKEN_KEYS) {
    if (tokens[key] != null) root.style.setProperty(key, tokens[key])
  }
}

/** Override one accent role with a user-picked hex color. */
export function applyCustomColor(roleDef, hex) {
  const root = document.documentElement
  root.style.setProperty(roleDef.vars.fg, hex)
  if (roleDef.vars.emphasis) root.style.setProperty(roleDef.vars.emphasis, hex)
  if (roleDef.vars.muted) {
    root.style.setProperty(roleDef.vars.muted, `color-mix(in srgb, ${hex} 15%, transparent)`)
  }
}

/** Validate the { role: '#rrggbb' } override map from storage. */
export function normalizeCustomColors(value) {
  const fallback = { primary: null, secondary: null, tertiary: null }
  if (!value || typeof value !== 'object') return fallback
  const hex = (v) => (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v : null)
  return { primary: hex(value.primary), secondary: hex(value.secondary), tertiary: hex(value.tertiary) }
}
