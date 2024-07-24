import pluginJs from "@eslint/js"
import globals from "globals"

export default [
	pluginJs.configs.recommended,
	{
		languageOptions: {
			globals: globals.browser
		},
		rules: {
			"semi": [
				"error",
				"never",
				{
					"beforeStatementContinuationChars": "never"
				}
			],
			"semi-spacing": [
				"error",
				{
					"after": true,
					"before": false
				}
			],
			"semi-style": [
				"error",
				"first"
			],
			"no-extra-semi": "error",
			"no-unexpected-multiline": "error",
			"no-unreachable": "error"
		}
	},
]
