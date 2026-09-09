# Security

## Report a vulnerability

Please submit a private report through [Security → Report a vulnerability](https://github.com/LZSMIAO/2fa-hot/security/advisories/new).

Include the affected commit or version, reproduction steps and expected impact. Use public test secrets only; never include real account secrets, access tokens or user backups.

If private reporting is unavailable, contact [admin@2fa.hot](mailto:admin@2fa.hot). Do not disclose vulnerability details or sensitive data publicly.

## Supported version

Security fixes target the latest `main` branch. Self-hosted deployments need to update and redeploy.

## Privacy boundaries

- Homepage code generation and QR decoding run in the browser without a server-side code-generation API.
- New `/2fa#SECRET` links keep secrets and parameters in the URL fragment, which is not sent in the HTTP page request. Full links still contain secrets and may remain in browser history or be read by page scripts and permitted extensions.
- Legacy `/2fa/SECRET` links send secrets to the hosting service. New fragment links cannot undo earlier requests.
- Local history is opt-in. Password protection encrypts it; without a password, records are stored unencrypted in the current browser. Use a strong, independent passphrase.
- Local encryption does not protect a compromised device, page script or extension. Forgotten passphrases cannot be recovered. Keep backups and clipboard contents private.

The project includes automated security-related tests but has not undergone an independent security audit.
