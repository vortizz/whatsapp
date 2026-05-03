// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import eslintConfigPrettier from 'eslint-config-prettier'

export default withNuxt(eslintConfigPrettier, {
  rules: {
    // TypeScript handles prop types — no need to redeclare them
    'vue/require-prop-types': 'off',
    'vue/require-default-prop': 'off',

    // Style: warn instead of error so they don't block builds
    'vue/attributes-order': 'warn',
    'vue/attribute-hyphenation': 'warn',
    'vue/v-on-event-hyphenation': 'warn',
    'vue/html-self-closing': 'off',
    'vue/prop-name-casing': 'off',
    'vue/order-in-components': 'warn',

    // Keep these as errors — they catch real bugs
    'vue/require-explicit-emits': 'error',
    'vue/no-dupe-keys': 'error',
    'vue/no-reserved-keys': 'error',
    'vue/no-v-html': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],

    // Relax any — consistent with backend config
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-dynamic-delete': 'off',
  },
})
