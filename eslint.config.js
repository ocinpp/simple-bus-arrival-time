import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs["flat/recommended"],
    {
        languageOptions: {
            globals: {
                ...globals.browser,
            },
            parserOptions: {
                parser: tseslint.parser,
            },
        },
        rules: {
            "vue/multi-word-component-names": "off",
            "vue/html-indent": "off",
        },
    }
);
