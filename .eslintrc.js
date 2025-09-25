/** Root ESLint for monorepo (starter-friendly) */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals","eslint:recommended","plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint","react","react-hooks"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-empty-object-type": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "react/no-unescaped-entities": "off",
    "react/jsx-key": "warn",
    "react-hooks/rules-of-hooks": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "no-case-declarations": "off",
    "prefer-const": "off",
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["@/components/ui/*", "../components/ui/*", "../../components/ui/*"],
            "message": "Use @starter/ui for primitives to keep the design system centralized."
          }
        ]
      }
    ]
  },
  overrides: [
    {
      files: ["apps/web/src/app/(app)/settings/billing/page.tsx"],
      rules: {
        "no-restricted-imports": "off"
      }
    }
  ]
};
