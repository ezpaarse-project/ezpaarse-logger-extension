import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: [
    '@wxt-dev/module-vue',
    '@wxt-dev/i18n/module',
  ],
  manifest: ({ browser }) => {
    let browserSettings;

    if (browser === 'firefox') {
      browserSettings = {
        gecko: {
          id: '{9378b220-059c-434c-ad26-03043ecd7a09}',
          data_collection_permissions: {
            required: ['browsingActivity'],
          }
        },
      }
    }

    return {
      name: 'ezPAARSE Logger (Extension)',
      default_locale: 'en',
      browser_specific_settings: browserSettings,
      permissions: [
        'storage',
        'webRequest',
      ],
      host_permissions: [
        '<all_urls>',
      ],
    }
  },
});
