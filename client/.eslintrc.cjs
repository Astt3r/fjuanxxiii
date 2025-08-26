module.exports = {
  env: { browser: true, es2022: true },
  extends: ['react-app', 'react-app/jest'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  },
};
