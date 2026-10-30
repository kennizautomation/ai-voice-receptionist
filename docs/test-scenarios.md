# Test Plan and Acceptance Criteria

> This is a **test specification**, not a report claiming these live call tests were executed.

## Functional scenarios

| ID | Scenario | Expected outcome |
| --- | --- | --- |
| T01 | First-time caller requests an appointment | Ask required details and check real calendar availability |
| T02 | Requested slot is available | Read back date/time/timezone; book only after confirmation |
| T03 | Requested slot is unavailable | Suggest only slots returned by availability tool |
| T04 | Caller does not confirm | Do not create a booking |
| T05 | Calendar API timeout | State booking is unconfirmed; route to callback/human |
| T06 | CRM write fails after calendar booking succeeds | Retain booking ID, alert for CRM repair; do not duplicate |
| T07 | Duplicate booking tool request | Idempotency prevents duplicate appointments |
| T08 | Caller asks to reschedule | Apply verification and availability check before updating |
| T09 | Caller requests cancellation | Verify booking ownership/authorization before cancelling |
| T10 | Caller asks for a human | Transfer to a verified destination or offer callback |
| T11 | Caller gives incomplete phone/email | Ask for clarification, flag invalid details without inventing |
| T12 | Caller changes time zone or date | Reconfirm full local date, time, and time zone |
| T13 | Incoming request contains malicious text | Treat text as data; never follow injected instructions |
| T14 | Caller disconnects mid-booking | Preserve safe partial state; no unconfirmed booking claims |
| T15 | Out-of-hours caller needs help | Give approved hours and safe next step |
| T16 | Sensitive or urgent request | Follow escalation guidance and avoid unsupported advice |

## Acceptance criteria

- Confirmed appointments always have a calendar-created booking ID.
- Agent never invents slots or asserts success without a tool result.
- Booking confirmation requires explicit caller approval.
- CRM and calendar results are tracked independently.
- Tool retries do not generate duplicate calendar events.
- Logs contain no API tokens or unnecessary sensitive information.
- Human handoff and callback fallback are available when configured.
- Date/time handling is explicit about the business time zone.

## How to verify

1. Use a test phone number and sandbox calendar/CRM.
2. Populate approved FAQs and service/business-hour rules.
3. Run the scenarios above with synthetic callers and records.
4. Compare tool outputs with calendar/CRM records.
5. Record actual results, gaps, and fixes before claiming production readiness.

## Results template

| Test ID | Date | Result (pass/fail) | Evidence link | Notes |
| --- | --- | --- | --- | --- |
| T01 | Not run | Not run | — | Production environment not configured |

This project has **not** performed live integration tests.
