# Validation — interactive frontend

Validated in the provided execution environment using Node.js 24 and headless Chromium.

## Passed

- Vite production build.
- ESLint checks.
- End-to-end browser workflow suite (`npm run test:browser`).
- HTTP adapter contract/error suite (`npm run test:api`) with mocked server responses.

## Browser workflow coverage

- Incident search, combined filters, analysis, status changes, notes, and persistence after reload.
- Multiple conversations; sending, cancelling, retrying without duplicate messages, reopening saved conversations, and preserved context.
- Saving verified findings to Memory and attaching them to a new investigation.
- History rename, export, clear cancellation, and confirmed clearing.
- Actual JSON download contents, not just a download button click.
- Effective evidence visibility, animation preference, and new-conversation persistence settings.
- Session-only conversations disappear after reload and are not saved to localStorage.
- Automatic analysis when an incident without analysis is opened.
- Memory clearing and demo reset.
- Service dialog content, Escape dismissal, and focus restoration.
- Dashboard question handoff and unknown-route redirect.
- All seven routes at 320, 390, 768, and 1440 CSS pixels without document-level horizontal overflow.
- Reduced-motion mode disables route animation.
- No JavaScript page errors in the workflow suite.

## HTTP adapter coverage

- Failed workspace request and successful retry.
- Connected mode renders backend-provided replies.
- Failed message request retains the draft.
- Retry reuses the requestId and existing conversation.
- Failed refresh preserves previously loaded data.

## Limits

Tests use Chromium and mock data. A real backend, authentication service, AI model, mobile Safari, and production deployment have not been connected or validated. The interface is ready for integration; backend implementation remains separate.
