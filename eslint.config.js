import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ['node_modules', 'node_modules/**', '.pnp', '.pnp/**', '.pnp.js', '**/.pnp.js/**', 'coverage', 'coverage/**', 'test-results/', 'test-results/**/', 'playwright-report/', 'playwright-report/**/', 'playwright/.cache/', 'playwright/.cache/**/', 'dist', 'dist/**', 'high-level-dependencies.html', '**/high-level-dependencies.html/**', '.DS_Store', '**/.DS_Store/**', '*.pem', '**/*.pem/**', 'npm-debug.log*', '**/npm-debug.log*/**', 'yarn-debug.log*', '**/yarn-debug.log*/**', 'yarn-error.log*', '**/yarn-error.log*/**', '.pnpm-debug.log*', '**/.pnpm-debug.log*/**', '.env*.local', '**/.env*.local/**', '.vercel', '**/.vercel/**'],
})
