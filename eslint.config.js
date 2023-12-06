// eslint.config.js
import antfu from '@antfu/eslint-config';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat();

export default antfu(
    {
        stylistic: {
            indent: 4,
            quotes: 'single',
            semi: true,
        },
        vue: true,
        typescript: true,
    },
    ...compat.config({
        root: true,
        extends: ['plugin:tailwindcss/recommended'],
    }),
);
