import { applySecurityHeaders } from '../utils/security-headers'

// H3 sendRedirect can finish before beforeResponse hooks run.
export default defineEventHandler(applySecurityHeaders)
