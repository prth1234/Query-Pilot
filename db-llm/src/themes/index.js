/**
 * Query Pilot theme registry (MODULAR).
 *
 * Each theme lives in its own file in this folder with the shape:
 *   { id, name, description, primerMode, editorTheme, tokens }
 *
 * To add a theme:
 *   1. Copy any `<theme>.js` file, rename it, change the values.
 *   2. Import it below and add it to THEME_MODULES.
 * No CSS or component edits needed.
 */
import { applyTokens, applyCustomColor, normalizeCustomColors, CUSTOM_ROLES } from './tokens'

import githubDark from './github-dark'
import githubLight from './github-light'
import dracula from './dracula'
import tokyoNight from './tokyo-night'
import nord from './nord'
import monokai from './monokai'
import solarizedLight from './solarized-light'
import emerald from './emerald'
import ocean from './ocean'
import sunset from './sunset'
import forestGrove from './forest-grove'
import ivory from './ivory'
import roseGold from './rose-gold'
import lavender from './lavender'
import midnight from './midnight'
import mocha from './mocha'
import crimson from './crimson'
import sage from './sage'

const THEME_MODULES = [
  githubDark,
  githubLight,
  dracula,
  tokyoNight,
  nord,
  monokai,
  solarizedLight,
  emerald,
  ocean,
  sunset,
  forestGrove,
  ivory,
  roseGold,
  lavender,
  midnight,
  mocha,
  crimson,
  sage,
]

export const SYSTEM_THEME_ID = 'system'
export { CUSTOM_ROLES, normalizeCustomColors }

/** Picker metadata — swatches derived straight from each theme's tokens. */
export const APP_THEMES = THEME_MODULES.map((t) => ({
  id: t.id,
  name: t.name,
  description: t.description,
  primerMode: t.primerMode,
  editorTheme: t.editorTheme,
  isLight: t.primerMode === 'light',
  swatch: {
    bg: t.tokens['--bg-canvas'],
    fg: t.tokens['--fg-default'],
    primary: t.tokens['--accent-fg'],
    secondary: t.tokens['--accent-secondary'],
    tertiary: t.tokens['--accent-tertiary'],
  },
}))

export function getAppTheme(id) {
  return APP_THEMES.find((t) => t.id === id) || APP_THEMES[0]
}

function getThemeModule(id) {
  return THEME_MODULES.find((t) => t.id === id) || THEME_MODULES[0]
}

/** Resolve Primer `colorMode` for a given theme id + system preference. */
export function getPrimerMode(themeId, systemPrefersDark = true) {
  if (themeId === SYSTEM_THEME_ID) return systemPrefersDark ? 'dark' : 'light'
  return getAppTheme(themeId).primerMode
}

/** Resolve the effective theme id (expands 'system' using media query). */
export function resolveThemeId(themeId, systemPrefersDark = true) {
  if (themeId === SYSTEM_THEME_ID) return systemPrefersDark ? 'dark' : 'light'
  return getAppTheme(themeId).id
}

/** Migrate legacy stored values ('dark' / 'light' already valid). */
export function normalizeStoredTheme(value) {
  if (!value) return 'dark'
  if (value === SYSTEM_THEME_ID) return SYSTEM_THEME_ID
  if (THEME_MODULES.some((t) => t.id === value)) return value
  if (value === 'github-dark') return 'dark'
  if (value === 'github-light') return 'light'
  return 'dark'
}

/**
 * Apply a theme: sets `data-theme` + `data-color-mode` on <html> and paints
 * the token set as inline CSS vars, then layers user custom accent colors.
 * `customColors` = { primary, secondary, tertiary } with hex or null values.
 */
export function applyTheme(themeId, customColors = {}) {
  const normalized = getAppTheme(themeId)
  const module = getThemeModule(normalized.id)
  const root = document.documentElement

  root.setAttribute('data-theme', module.id)
  root.setAttribute('data-color-mode', module.primerMode)
  // Themes native scrollbars / form controls to match (kills white edges)
  root.style.colorScheme = module.primerMode

  applyTokens(module.tokens)

  const customs = normalizeCustomColors(customColors)
  for (const roleDef of CUSTOM_ROLES) {
    const hex = customs[roleDef.role]
    if (hex) applyCustomColor(roleDef, hex)
  }

  return normalized
}

/** Default (un-customized) accent colors for a theme id. */
export function getThemeAccents(themeId) {
  const module = getThemeModule(getAppTheme(themeId).id)
  return {
    primary: module.tokens['--accent-fg'],
    secondary: module.tokens['--accent-secondary'],
    tertiary: module.tokens['--accent-tertiary'],
  }
}
