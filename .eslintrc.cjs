module.exports = {
  extends: [
    'eslint:recommended', //推奨のルールセット
    'plugin:react/recommended', //Reactの推奨ルールセット
    'plugin:react/jsx-runtime', //ReactのJSX runtimeの推奨ルールセット
    '@electron-toolkit/eslint-config-ts/recommended', //TypeScriptの推奨ルールセット
    '@electron-toolkit/eslint-config-prettier' //Prettierの推奨ルールセット
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off', //関数の戻り値の型を明示するルールを無効化
    '@typescript-eslint/no-unused-vars': 'off' //未使用の変数を許可するルールを無効化
  }
}
