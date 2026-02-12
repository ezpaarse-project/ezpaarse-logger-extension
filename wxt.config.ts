import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: [
    '@wxt-dev/module-vue',
    '@wxt-dev/i18n/module',
  ],
  manifest: {
    name: 'ezPAARSE Logger (Extension)',
    default_locale: 'en',
    permissions: [
      'storage',
      'webRequest',
    ],
    host_permissions: [
      '<all_urls>',
    ],
  },
});
