# Frontend Working Guide

This file defines the conventions to follow when changing this accounting frontend. Keep changes small, readable, and consistent with the existing pages.

## Project stack

- React 19 with functional components and hooks
- Vite 8
- React Router
- Tailwind CSS 4
- Axios through the shared API client
- Lucide React icons
- JavaScript and JSX; this project does not use TypeScript
- ES modules (`"type": "module"`)

## Commands

Run commands from the repository root.

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

- The normal development command is `npm run dev`.
- Always run `npm run build` after functional or layout changes.
- Run ESLint on changed files when possible.
- The repository currently has some pre-existing lint errors in unrelated files. Do not modify unrelated files merely to make the full lint command pass. Clearly distinguish pre-existing errors from errors introduced by the current change.

## Environment

- API base URL: `VITE_API_BASE_URL`
- Default API base URL: `https://localhost:7100`
- Company state: `VITE_COMPANY_STATE`
- Default company state: `Kerala`
- Never hardcode a production API URL inside a page or component.

## Source structure

- `src/pages/`: route-level pages and their state/handlers
- `src/components/`: reusable UI components
- `src/components/common/`: shared Button, Toast, Dropdown, Layout, confirmation modals, and other common UI
- `src/services/`: domain API functions
- `src/api/apiEndpoints.js`: endpoint definitions
- `src/api/axiosClient.js`: shared Axios instance
- `src/api/index.js`: Axios instance with interceptors attached
- `src/utils/`: request/response mapping helpers

Keep API calls out of page JSX. Add a small domain service function and return `response.data`, following `company.js`, `terms.js`, `quotation.js`, `purchase.js`, and `prefix.js`.

## Code style

- Write beginner-friendly code with clear state names and small handler functions.
- Prefer the patterns already used in `Purchase.jsx`, `PurchaseList.jsx`, `Quotation.jsx`, `QuotationList.jsx`, and `Company.jsx`.
- Avoid unnecessary abstractions, custom frameworks, deeply nested callbacks, and clever indirect code.
- Do not introduce a helper when a short direct handler is clearer.
- Use early returns for guards.
- Keep API response checks explicit: `response?.success` and `response?.data`.
- Preserve existing UI and API behavior unless the task explicitly requests a behavior change.
- Do not rewrite or reformat unrelated code.
- Use `.jsx` extensions for React components and `.js` for services/utilities.
- Component files use PascalCase; service files use camelCase or a simple lowercase domain name.

## API and backend rules

- Never invent backend data, IDs, document numbers, totals, statuses, or successful results in the frontend.
- Never generate a document number in the frontend when the backend is responsible for numbering.
- Do not add fallback/sample business records to make an incomplete backend feature look functional.
- If an endpoint or required response field is missing, incomplete, empty, or untested, report it clearly as a backend gap.
- Swagger presence proves that an endpoint is exposed; it does not prove the endpoint has passed runtime testing.
- Use the backend response as the source of truth.
- Reuse existing endpoints before requesting or inventing a new endpoint.
- Keep request payload property names aligned with the backend contract.
- Display backend error messages when available: `error.response?.data?.message`.
- Do not hide a real backend state merely to imitate another page. For example, if a draft was already created by the backend, showing `Draft saved` is valid.

## Draft flow conventions

Use Purchase and Quotation as the reference patterns.

- Status text should use these states: `Unsaved changes`, `Saving draft...`, and `Draft saved`.
- Edit handlers mark the page as unsaved.
- Autosave changes the state to saving, then saved or back to unsaved on failure.
- Final save/commit must use the backend endpoint and backend-generated document number.
- Active drafts belong in the list page behind a `Drafts` toggle button with a count badge.
- A draft row should open the existing draft route.
- Draft discard must use a confirmation modal and the backend discard endpoint.
- Do not add a separate manual `Save Draft` button when the established page flow uses autosave and a final-save action.

## Proforma Invoice status

The Proforma Invoice frontend currently uses the shared `Invoice.jsx` page for Proforma and Sales Invoice routes.

- Determine the mode from the route before loading or saving data.
- Proforma draft create/get/update/commit APIs are separate from finalized Proforma Invoice list/detail/delete APIs.
- PI number generation belongs to the backend commit/finalize flow. Do not construct a PI number in the frontend.
- Prefix values come from the document-prefix settings API.
- Proposal Reference uses the Quotation API. If the API returns an empty list, do not create fake quotation options.
- Product selection uses the existing Products API.
- Attachment upload, download, and delete must not be presented as complete until the relevant attachment APIs are connected and tested.
- Sales Invoice and Proforma Invoice share UI, but their data/API behavior must remain route-specific.

## Notifications and errors

- Use `src/components/common/Toast.jsx` for success and operation errors.
- Success Toast styling follows the gold brand theme, not green.
- Use red/rose styling for errors.
- Do not show the same success message both inline and in a Toast.
- Inline draft save status is allowed because it represents continuous state, not a one-time notification.
- Clear field-specific validation errors when that field changes.
- An API error must not permanently disable editing or retrying. Disable buttons only while loading/submitting or when the action is genuinely unavailable.

## Design system

### Font

- Primary font: Montserrat
- Fallback: Arial, sans-serif
- Default font weight: 500
- Use `font-sans`; do not add a different page font.

### Brand colors

Use theme classes instead of repeating hex values when a token exists.

- `brand-gold`: `#8c6723`
- `brand-gold-hover`: `#72521a`
- `brand-gold-light`: `#fbf5e7`
- `brand-gold-highlight`: `#e4c477`
- `brand-dark`: `#241f1a`
- Page background: `#f8f9fa`
- Card/input background: white
- Main text: `#1c1917`
- Muted text: `#78716c`
- Subtle border: `#e7e5e4`

Use stone colors for neutral content, brand gold for primary actions/highlights, and rose/red for destructive actions/errors. Avoid green for branded success Toasts.

### Common sizing

- Page title: usually `text-2xl font-bold`
- Page description: `text-sm text-stone-500`
- Field label: `text-xs font-semibold`
- Standard input height: `h-[42px]`
- Input/card radius: generally `rounded-xl`
- Page section gap: generally `gap-4`, `gap-5`, or `gap-6`
- Desktop summary column: generally `280px`
- Shared Button default: `px-4 py-2.5`, `text-xs`, `font-bold`, `rounded-lg`
- Lucide button icon default: 15px through the shared Button component

### Shared components

- Use `Button.jsx`; do not duplicate its primary/outline/danger styles.
- Use `Toast.jsx`; do not build page-specific toast markup.
- Use `Dropdown.jsx` for styled selects.
- Use `DeleteConfirmationModal.jsx` before destructive actions.
- Use `LoadingSpinner.jsx` or established table skeletons for loading states.

## Layout and scrolling

- `Layout.jsx` owns the application viewport and the main vertical scrollbar.
- Pages must not add another full-page vertical scrollbar.
- Use `min-w-0` on grid/flex children containing wide tables.
- Follow the Purchase page layout for document forms:
  - one responsive grid;
  - main form column using `minmax(0, 1fr)`;
  - summary column at 280px on extra-large screens;
  - explicit wrappers/order for Information, Items, Terms, and Summary.
- Wide item tables may have their own horizontal `overflow-x-auto` container.
- Do not use page-level `h-screen`, `100vh`, or `overflow-y-auto` inside route pages; the shared Layout already owns those concerns.
- Modals may use their own constrained vertical scrolling.

## Responsive behavior

- Build mobile-first with Tailwind breakpoints.
- Keep desktop actions in the header and use the existing mobile action area below the form where applicable.
- Tables may define a minimum width and scroll horizontally within their section.
- Do not let a table expand the entire application viewport.

## Forms

- Keep controlled input state in the page or form owner.
- Use immutable state updates.
- Validate before API submission.
- Clear the relevant validation message when the user edits that field.
- Read-only backend-generated values must remain read-only.
- Do not silently alter backend-returned business data.
- Disable submit buttons only during actual submission/loading or when required backend state is unavailable.

## Verification checklist

Before finishing a change:

1. Confirm routes still render the correct mode/page.
2. Confirm API calls go through a service and shared Axios client.
3. Confirm backend messages appear through the established feedback UI.
4. Confirm loading, success, failure, retry, and empty states.
5. Confirm inputs remain editable after recoverable errors.
6. Confirm desktop and mobile action areas.
7. Confirm only one page-level vertical scrollbar exists.
8. Confirm wide tables scroll horizontally inside their section.
9. Run `npm run build`.
10. Run ESLint on changed files and report any pre-existing issues separately.

