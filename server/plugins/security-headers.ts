import { applySecurityHeaders } from '../utils/security-headers'

export default defineNitroPlugin((nitroApp) => {
  // Error renderers can replace headers after middleware has run.
  nitroApp.hooks.hook('beforeResponse', applySecurityHeaders)
})
