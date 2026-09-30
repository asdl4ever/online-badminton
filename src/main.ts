import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
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
        dark: true,
        colors: {
          background: '#070d16',
          surface: '#101b2d',
          'surface-bright': '#16253c',
          'surface-variant': '#1b2c45',
          primary: '#4ea3ff',
          'primary-darken-1': '#2f7fe0',
          secondary: '#ff7a59',
          success: '#58d68d',
          warning: '#ffd166',
          error: '#ff8a8a',
          info: '#6ff0ff',
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
