import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
// self-hosted so the UI never depends on fonts.gstatic.com (blocked in CN).
// latin subset only: the CJK text falls through to the platform font anyway,
// so shipping thai/vietnamese/latin-ext would be dead weight.
import '@fontsource/chakra-petch/latin-400.css';
import '@fontsource/chakra-petch/latin-600.css';
import '@fontsource/chakra-petch/latin-700.css';
import './style.css';
import App from './App.vue';
import { router } from './router';

/**
 * Custom dark theme. Colours are kept in sync with the game's palette so the
 * menus and the court feel like one product. Most of the actual surface
 * treatment lives in style.css (`.glass*`) rather than in the theme, because
 * the look is a translucent material, not a set of Material colours.
 */
const vuetify = createVuetify({
  theme: {
    defaultTheme: 'court',
    themes: {
      court: {
        dark: false,
        colors: {
          background: '#eef3fa',
          surface: '#ffffff',
          'surface-bright': '#f2f6fb',
          'surface-variant': '#e6eef8',
          primary: '#1f6fd0',
          'primary-darken-1': '#175aad',
          secondary: '#c9451f',
          success: '#1f9d55',
          warning: '#a86a00',
          error: '#c02c2c',
          info: '#1f7f8f',
        },
      },
    },
  },
  defaults: {
    VBtn: { variant: 'flat', rounded: 'lg', ripple: true },
    VTextField: { variant: 'solo', density: 'comfortable', hideDetails: true },
  },
});

createApp(App).use(createPinia()).use(router).use(vuetify).mount('#app');
