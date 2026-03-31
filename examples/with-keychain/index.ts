// Run: npx tsx examples/with-keychain/index.ts

import { loadKeytar } from 'termui/keychain';

const SERVICE = 'termui-example';
const ACCOUNT = 'demo-api-key';
const DEMO_VALUE = 'sk-demo-1234567890abcdef';

async function main() {
  // On CI or environments without a native keychain (e.g. headless Linux),
  // keytar will fail to load. We exit gracefully in that case.
  let keytar: Awaited<ReturnType<typeof loadKeytar>>;

  try {
    keytar = await loadKeytar();
  } catch (err) {
    console.log('Could not load keytar (native bindings unavailable).');
    console.log('This is expected on CI or systems without a system keychain.');
    console.log('\nInstall keytar with: pnpm add keytar');
    console.log('Note: keytar requires native build tools (node-gyp).');
    process.exit(0);
  }

  if (!keytar) {
    console.log('keytar is not available in this environment.');
    console.log('Possible reasons:');
    console.log('  - Running in a CI environment without a keychain daemon');
    console.log('  - keytar is not installed: pnpm add keytar');
    console.log('  - Missing native build tools (node-gyp / libsecret)');
    console.log('\nSkipping demo — exiting cleanly.');
    process.exit(0);
  }

  console.log('keytar loaded successfully.\n');
  console.log(`Service : ${SERVICE}`);
  console.log(`Account : ${ACCOUNT}\n`);

  // --- SET ---
  console.log(`[1/3] Storing password...`);
  try {
    await keytar.setPassword(SERVICE, ACCOUNT, DEMO_VALUE);
    console.log(`      Stored: "${DEMO_VALUE}"\n`);
  } catch (err) {
    console.error('Failed to store password:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  // --- GET ---
  console.log(`[2/3] Retrieving password...`);
  try {
    const retrieved = await keytar.getPassword(SERVICE, ACCOUNT);
    if (retrieved === null) {
      console.error('      Password not found — unexpected after a successful set.');
      process.exit(1);
    }
    console.log(`      Retrieved: "${retrieved}"`);
    console.log(`      Match: ${retrieved === DEMO_VALUE ? 'yes' : 'NO (mismatch!)'}\n`);
  } catch (err) {
    console.error('Failed to retrieve password:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  // --- DELETE ---
  console.log(`[3/3] Deleting password...`);
  try {
    const deleted = await keytar.deletePassword(SERVICE, ACCOUNT);
    console.log(`      Deleted: ${deleted ? 'yes' : 'not found (already gone)'}\n`);
  } catch (err) {
    console.error('Failed to delete password:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  // Verify deletion
  const check = await keytar.getPassword(SERVICE, ACCOUNT);
  if (check === null) {
    console.log('Verification: password is gone from keychain.');
  } else {
    console.warn('Verification: password still present — deletion may have failed.');
  }

  console.log('\nDemo complete.');
}

main();
