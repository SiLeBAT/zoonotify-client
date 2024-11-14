module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint",
        "eslint-comments",
        "jest",
        "promise",
        "unicorn"
    ],
    extends: [
        "airbnb-typescript",
        "plugin:@typescript-eslint/recommended",
        "plugin:eslint-comments/recommended",
        "plugin:jest/recommended",
        "plugin:promise/recommended",
        "plugin:import/recommended",
        "prettier"
    ],
    parserOptions: {
        project: "./tsconfig.json",
    },
    env: {
        node: true,
        browser: true,
        jest: true,
    },
    overrides: [
        {
            files: ['**/*.test.js', '**/*.spec.js', 'src/setupTests.js'], // Define file patterns here
            rules: {
                // Place test-specific rules here if needed
            },
        },
    ],
    rules: {
        "no-prototype-builtins": "off",
        "import/prefer-default-export": "off",
        "import/no-default-export": "error",
        "react/destructuring-assignment": "off",
        "react/jsx-filename-extension": "off",
        '@typescript-eslint/no-var-requires': 'off',
        "no-use-before-define": [
            "error",
            { functions: false, classes: true, variables: true },
        ],
        "@typescript-eslint/explicit-function-return-type": [
            "error",
            { allowExpressions: true, allowTypedFunctionExpressions: true },
        ],
        "@typescript-eslint/no-use-before-define": [
            "error",
            {
                functions: false,
                classes: true,
                variables: true,
                typedefs: true,
            },
        ],
        "unicorn/prevent-abbreviations": "off",
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        "unicorn/no-reduce": "off",
        "@typescript-eslint/no-explicit-any": 2,
        "unicorn/filename-case": "off",
        "unicorn/no-null": "off",
    },
};
