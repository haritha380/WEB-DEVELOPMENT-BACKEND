import js from "@eslint/js";
import sonarjs from "eslint-plugin-sonarjs";

export default [
    js.configs.recommended,
    {
        plugins: {
            sonarjs: sonarjs
        },
        rules: {
            "sonarjs/cognitive-complexity": ["error", 15],
            "sonarjs/no-duplicate-string": ["error", 3],
            "sonarjs/no-identical-functions": "error",
            "sonarjs/no-small-switch": "error",
            "sonarjs/prefer-immediate-return": "error"
        },
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: "module"
        },
        env: {
            node: true,
            es2021: true,
            jest: true
        }
    }
];
