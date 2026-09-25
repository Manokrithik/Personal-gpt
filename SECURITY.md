# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

PersonalGPT is committed to user privacy and secure local processing. If you discover a security vulnerability:

1. **Do not create a public issue.**
2. Send vulnerability details to `security@personalgpt.local` with reproduction steps.
3. We will acknowledge receipt within 48 hours and coordinate remediation.

## Security Architecture Principles

- **Zero Secret Commits**: Secrets and API keys are strictly configured via `.env` and handled server-side.
- **Client Shielding**: Cloud API keys are never leaked to frontend browser JavaScript.
- **Path Traversal Protection**: Uploaded filenames are sanitized and secured using UUID references.
- **Safe Sandboxing**: File uploads are restricted in size, MIME-checked, and isolated from executable paths.
- **No Direct Shell Injection**: Agent and tool executors validate arguments and prevent arbitrary shell evaluation.
