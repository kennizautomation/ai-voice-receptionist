# System Architecture & Call Lifecycle

## Scope

This is a reference design for a service-business inbound AI receptionist. The production implementation must be adapted to the selected voice platform, calendar, CRM, business hours, consent requirements, and local regulations.

## Components

1. **Telephony** — receives the inbound call and delivers audio to a supported voice provider.
2. **Voice agent** — interprets intent, follows approved instructions, asks clarifying questions, invokes allowed tools, and speaks only confirmed outcomes.
3. **n8n orchestration** — validates incoming tool/webhook payloads; calls calendar and CRM APIs; returns normalized success/error results.
4. **Calendar** — checks open slots and creates, updates, or cancels appointments subject to authorization.
5. **CRM** — upserts contact details, records status, and associates bookings with correct records.
6. **Human handoff** — transfers where supported or creates a callback request with clear status.
7. **Observability** — captures minimal event metadata, tool failures, retries, and alerting without exposing sensitive details.

## Detailed booking sequence

```mermaid
sequenceDiagram
  participant Caller
  participant Agent as Voice AI agent
  participant WF as n8n integration
  participant Cal as Calendar
  participant CRM
  Caller->>Agent: I would like an appointment
  Agent->>Caller: Ask service and preferred date/time
  Agent->>WF: check_availability(request)
  WF->>Cal: Read available slots
  Cal-->>WF: Slots or error
  WF-->>Agent: normalized availability result
  alt Slot available
    Agent->>Caller: Confirm local date, time, timezone
    Caller-->>Agent: Yes
    Agent->>WF: book_appointment(request, idempotency_key)
    WF->>Cal: Create booking
    Cal-->>WF: confirmed booking ID
    WF->>CRM: Upsert contact and booking reference
    CRM-->>WF: write result
    WF-->>Agent: booking status, ID, CRM status
    Agent->>Caller: State confirmed booking only if calendar succeeded
  else Slot unavailable
    Agent->>Caller: Offer actual alternative slots
  else Provider failure
    Agent->>Caller: Say booking cannot be confirmed; offer callback or human
  end
```

## Example tool contracts (conceptual)

The tool schema below is a **normalized application contract**. Actual Retell/Vapi tool registration and transport details must follow the provider's current documentation.

### check_availability

Input:

```json
{
  "service": "assessment",
  "requested_local_date": "2030-06-12",
  "requested_local_time": "10:00",
  "timezone": "America/Chicago",
  "duration_minutes": 60
}
```

Output:

```json
{
  "status": "ok",
  "available": true,
  "slots": [
    {"start_at": "2030-06-12T10:00:00-05:00", "timezone": "America/Chicago"}
  ]
}
```

### book_appointment

Input:

```json
{
  "contact_name": "Alex Example",
  "contact_email": "alex@example.com",
  "contact_phone": "+15555550101",
  "service": "assessment",
  "start_at": "2030-06-12T10:00:00-05:00",
  "timezone": "America/Chicago",
  "confirmed_by_caller": true,
  "idempotency_key": "demo-call-001-slot-001"
}
```

Output on success:

```json
{
  "status": "confirmed",
  "booking_id": "demo-booking-001",
  "start_at": "2030-06-12T10:00:00-05:00"
}
```

Output on failure:

```json
{
  "status": "failed",
  "error_code": "calendar_unavailable",
  "message": "Booking could not be confirmed."
}
```

### request_human_handoff

Input: `{ "reason": "caller_requested_human", "callback_requested": true }`

Output: `{ "status": "queued", "reference": "demo-callback-001" }`

## Reliability requirements

- Availability results expire; recheck conflicts immediately before booking.
- Use a stable idempotency key per booking attempt to reduce duplicate writes.
- Report calendar success separately from CRM synchronization success.
- If calendar succeeds but CRM fails, preserve the booking ID, alert for reconciliation, and **do not create a duplicate booking**.
- Retry safe transient errors with bounded backoff and logging.
- Normalize and validate all webhooks before use.
- Do not treat user-stated dates as UTC unless explicitly converted.
- Do not confirm a booking solely because a request was sent.
- Handle end-of-call, cancellation, caller silence, transfer failure, and network interruptions.

## Example handoff rules

Escalate to a human when the caller asks, the request is unsupported, an urgent/sensitive situation arises, or the system cannot securely verify an account change.

## Security and privacy

Store secrets in approved credential stores; never in agent prompts or repository files. Collect the minimum necessary contact details and use the required consent, retention, and disclosure policies. The examples here contain fictional data only.
