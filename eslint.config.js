import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import security from 'eslint-plugin-security';
import globals from 'globals';
export default [
 { ignores: ['dist/**', 'node_modules/**', 'evidence/**'] },
 js.configs.recommended,
 // Leaflet is loaded explicitly from its CDN by this view before use.
 { files: ['src/establishment/presentation/views/map-of-establishments.vue'], languageOptions: { globals: { L: 'readonly' } } },
 ...vue.configs['flat/essential'],
 { files: ['src/**/*.{js,vue}'], languageOptions: { globals: { ...globals.browser, ...globals.node } },
   plugins: { security }, rules: {
    ...security.configs.recommended.rules,
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none', varsIgnorePattern: '^_' }],
    'vue/multi-word-component-names': 'off',
    'no-undef': 'error', 'no-var': 'error', 'prefer-const': 'warn',
    'eqeqeq': 'warn', 'complexity': ['warn', 15], 'max-depth': ['warn', 4]
   } }
];
