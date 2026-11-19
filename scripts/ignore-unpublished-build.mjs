// Keep this development version unpublished for ordinary Git-triggered builds.
// Netlify: exit 0 skips the build; exit 1 continues it. Other branches build normally.
process.exitCode = process.env.BRANCH === 'v4.1.2' ? 0 : 1;
