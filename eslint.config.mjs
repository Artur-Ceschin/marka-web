import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importX from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // 1. What ESLint should never look at. In flat config a bare `ignores`
  //    object is the replacement for .eslintignore.
  {
    ignores: ['dist', 'coverage', 'node_modules', 'public'],
  },

  // 2. Baseline JS rules.
  js.configs.recommended,

  // 3. Type-aware TypeScript rules. `recommendedTypeChecked` needs real type
  //    information, which `projectService: true` provides: it asks the TS
  //    language service for the right tsconfig per file, so we do not have to
  //    list every tsconfig by hand and files outside `include` still resolve.
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // 4. Config files run in Node and are not part of the app's type graph.
  //    Turning type-checking off for them avoids "file not included in project".
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: globals.node,
    },
  },

  // 5. The application source itself.
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
      'import-x': importX,
    },
    settings: {
      // The resolver turns an import specifier into a real file path. Without
      // it `@/lib/http` is an opaque string and the boundary rule below cannot
      // tell which layer it points at.
      'import-x/resolver-next': [createTypeScriptImportResolver({ alwaysTryTypes: true })],
    },
    rules: {
      // --- Hooks. Both as error: a violated dependency array is a real bug,
      // not a style preference, and the autofix is usually correct.
      ...reactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // --- Fast Refresh: a module exporting both a component and something
      // else loses hot-reload state. Constants are the common exception.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // --- Accessibility. Stated priority, so the whole recommended set is on.
      ...jsxA11y.flatConfigs.recommended.rules,

      // --- Import hygiene.
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroups: [{ pattern: '@/**', group: 'internal', position: 'before' }],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import-x/no-duplicates': 'error',

      // --- Standing rule: never `any`.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // `verbatimModuleSyntax` erases nothing implicitly, so unused type
      // imports become real runtime imports. Flag them.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // 6. ARCHITECTURE BOUNDARY — see the note in the project README.
  //    `no-restricted-paths` is directional: each zone says "code in `target`
  //    may not import from `from`". It is not symmetric, which is exactly what
  //    a layering rule needs.
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          basePath: import.meta.dirname,
          zones: [
            // Shared layers must not reach down into feature code. If a
            // component needs something from a feature, the dependency is
            // pointing the wrong way and the shared thing belongs to the
            // feature (or the feature's thing belongs in the shared layer).
            {
              target: './src/components',
              from: './src/features',
              message:
                'components/ is a shared layer and must not import from features/. Move the shared piece up, or move the component into the feature.',
            },
            {
              target: './src/lib',
              from: './src/features',
              message:
                'lib/ is a shared layer and must not import from features/. Move the shared piece up, or move the helper into the feature.',
            },
            // Features must not import from sibling features. `except` is
            // relative to `from`, so this reads: "nothing under src/features
            // may be imported from src/features, except its own directory".
            // One zone per feature is the price of that relativity.
            {
              target: './src/features/plants',
              from: './src/features',
              except: ['./plants'],
              message:
                'Features must not import from sibling features. Promote the shared piece to components/ or lib/.',
            },
          ],
        },
      ],
    },
  },

  // 7. Test files: relax the rules that fight with testing idioms.
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },

  // 8. LAST, always. Switches off every ESLint rule that only concerns
  //    formatting, so Prettier owns layout and ESLint owns correctness.
  //    Order matters: this must come after anything that enables such rules.
  prettier,
);
