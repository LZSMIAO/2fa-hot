import { oreTheme } from './utils/oreTheme'

export default defineAppConfig({
  ui: {
    ...oreTheme,
    colors: { primary: 'green', neutral: 'zinc' }
  }
})
