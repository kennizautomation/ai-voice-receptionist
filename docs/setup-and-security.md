# Deployment Prerequisites and Security Notes

This repository illustrates a design and code helper. It does not include an importable end-to-end n8n workflow or a configured agent.

## Prerequisites for a real implementation

- Authorized voice platform account (Retell AI or Vapi)
- Verified inbound number and approved telephony routing
- n8n instance with secure HTTPS endpoint and credential storage
- Calendar service account/OAuth with appropriate scopes
- CRM API access with least-privilege permissions
- Approved FAQs, scheduling rules, service hours, escalation destinations
- Business requirements for consent, AI disclosure, call recording, and retention

## Suggested build sequence

1. Configure a sandbox phone number and voice agent.
2. Add approved business information and agent instructions.
3. Define tool schemas for availability, booking, and escalation.
4. Create n8n webhook endpoints and validate requests/signatures as supported by the provider.
5. Connect to sandbox calendar and CRM using stored credentials.
6. Handle idempotency, timeouts, retries, and post-booking reconciliation.
7. Run the scenarios from [test-scenarios.md](test-scenarios.md).
8. Monitor, review actual results, and approve production release.

## Security checklist

- Never commit `.env`, secrets, tokens, or call transcripts containing personal details.
- Keep production endpoints and credentials out of public documentation.
- Verify provider webhook authenticity with provider-supported mechanisms.
- Validate payload schema and size before parsing.
- Use a strict allowlist for writable CRM fields.
- Apply least-privilege permissions to calendars and CRMs.
- Honor user consent, retention, and access/deletion requirements.
- Review prompt-injection risks from caller content.
- Log request IDs and outcomes without storing unnecessary raw customer data.

## Limitations

The Node.js normalizer provided under `examples/` is deliberately offline. Production services require live integrations, authorization, operational monitoring, and platform-specific configuration.
