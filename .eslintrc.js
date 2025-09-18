module.exports = {
    "env": {
        "node": true,
        "es2021": true,
        "jest": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:sonarjs/recommended"
    ],
    "plugins": [
        "sonarjs"
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "sonarjs/cognitive-complexity": ["error", 15],
        "sonarjs/no-duplicate-string": ["error", 3],
        "sonarjs/no-identical-functions": "error",
        "sonarjs/no-small-switch": "error",
        "sonarjs/prefer-immediate-return": "error"
    }
}
