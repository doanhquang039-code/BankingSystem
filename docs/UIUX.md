# UI/UX Guidelines
## Mini Banking System — Oct 2025

---

## 1. Design Philosophy

The Mini Banking System UI prioritizes **trust**, **clarity**, and **efficiency**.
Banking UIs must feel secure and professional while remaining accessible to non-technical users.

Core principles:
- **Clarity over cleverness** — every action must have a clear label and feedback
- **Error prevention** — validate inputs before submission; confirm destructive actions
- **Status visibility** — always show the current state (balance, KYC status, notification count)
- **Accessibility** — WCAG 2.1 AA minimum compliance

---

## 2. Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--primary` | `#1A56DB` | CTA buttons, links, active states |
| `--primary-dark` | `#1C3D91` | Hover on primary |
| `--secondary` | `#0E9F6E` | Success states, approved badges |
| `--danger` | `#E02424` | Errors, rejected badges, destructive actions |
| `--warning` | `#FF8A4C` | Pending states, warnings |
| `--neutral-900` | `#111827` | Primary text |
| `--neutral-600` | `#4B5563` | Secondary text |
| `--neutral-200` | `#E5E7EB` | Borders, dividers |
| `--neutral-50` | `#F9FAFB` | Page background |
| `--white` | `#FFFFFF` | Card backgrounds |

### Semantic Colors
| Meaning | Color |
|---|---|
| Success / Approved | `#0E9F6E` (green) |
| Danger / Rejected | `#E02424` (red) |
| Warning / Pending | `#FF8A4C` (orange) |
| Info / Resubmitted | `#1A56DB` (blue) |

---

## 3. Typography

**Font family**: `Inter` (Google Fonts)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--neutral-900);
}
```

| Role | Size | Weight | Usage |
|---|---|---|---|
| Page Title | 24px | 700 | `<h1>` – one per page |
| Section Header | 18px | 600 | `<h2>` card headers |
| Sub-header | 16px | 600 | `<h3>` table headers |
| Body | 14px | 400 | Default text |
| Small / Caption | 12px | 400 | Helper text, timestamps |
| Numeric (Balance) | 22px | 700 | Account balance display |

---

## 4. Component Patterns

### 4.1 Button Hierarchy

```
Primary:   Filled blue    → main CTA (Submit KYC, Transfer)
Secondary: Outlined blue  → secondary actions (Cancel, Back)
Danger:    Filled red     → destructive actions (Reject, Delete)
Ghost:     Text-only      → tertiary actions (View Details)
```

**States**: default → hover (darken 10%) → active (darken 20%) → disabled (opacity 40%)

### 4.2 Status Badges

```html
<!-- KYC Status -->
<span class="badge badge--pending">PENDING</span>
<span class="badge badge--approved">APPROVED</span>
<span class="badge badge--rejected">REJECTED</span>
<span class="badge badge--resubmitted">RESUBMITTED</span>
```

```css
.badge {
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}
.badge--pending      { background: #FFF3E0; color: #E65100; }
.badge--approved     { background: #E8F5E9; color: #2E7D32; }
.badge--rejected     { background: #FFEBEE; color: #C62828; }
.badge--resubmitted  { background: #E3F2FD; color: #1565C0; }
```

### 4.3 Transaction Amount Display

```
Incoming (+): green, bold  → "+5,000,000 ₫"
Outgoing (-): red, bold    → "-2,000,000 ₫"
Format: Vietnamese locale (dots for thousands, comma for decimal)
```

### 4.4 Notification Bell

- Bell icon in header with red badge showing unread count
- Badge disappears when count = 0
- Dropdown shows last 5 notifications with "View all" link
- Real-time update via WebSocket (no page refresh needed)

### 4.5 KYC Upload Flow

1. Customer clicks "Submit KYC" button
2. Step-by-step form: Personal Info → Upload Documents → Review → Submit
3. Progress indicator at top (3 steps)
4. Image upload with preview (drag & drop + click to browse)
5. After submit: success screen with "Your application is under review"

---

## 5. Layout

### Dashboard
```
┌─────────────────────────────────────────┐
│  Logo    Nav: Dashboard Accounts Txns   │
│          KYC  Notifications  [User]     │
├────────┬────────────────────────────────┤
│        │  Welcome, [Name]               │
│ Side   │  ┌──────┐ ┌──────┐ ┌────────┐ │
│ bar    │  │Total │ │Trans │ │ KYC    │ │
│        │  │Bal   │ │Count │ │ Status │ │
│        │  └──────┘ └──────┘ └────────┘ │
│        │                                │
│        │  Recent Transactions           │
│        │  [Table]                       │
└────────┴────────────────────────────────┘
```

### Responsive Breakpoints
| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 640px | Single column, collapsible sidebar |
| Tablet | 640–1024px | Two columns |
| Desktop | > 1024px | Full three-column layout |

---

## 6. Form Validation UX

- Validate on blur (not on every keystroke)
- Error message appears below the field in red
- Submit button disabled until all required fields pass validation
- Inline success feedback (green checkmark) after successful field validation

### Example Error State
```
┌─────────────────────────────┐
│ ID Number                   │
│ [001085012345            ] ← green border if valid
│                             │
│ ID Number (invalid)         │
│ [abc                  ] ← red border
│ ⚠ ID number must be numeric │
└─────────────────────────────┘
```

---

## 7. Real-Time Notification UX

When a WebSocket notification arrives:
1. Toast notification slides in from top-right (auto-dismiss after 4 seconds)
2. Bell icon badge count increments
3. Transaction table refreshes if user is on the transactions page

```
┌──────────────────────────────────────┐  ← slides in
│ 🔔 Tiền vào tài khoản               │
│ ACC000001 nhận +5,000,000 VND        │
│ ─────────────────────────────────── │
│ Just now                        [×]  │
└──────────────────────────────────────┘  ← auto-dismiss 4s
```

---

## 8. Accessibility Checklist

- [ ] All images have `alt` attributes
- [ ] Color is not the only indicator of state (use icons + text)
- [ ] All form inputs have associated `<label>` elements
- [ ] Focus visible on all interactive elements (tab navigation)
- [ ] Buttons have descriptive `aria-label` where icon-only
- [ ] Error messages linked to inputs via `aria-describedby`
- [ ] Minimum contrast ratio 4.5:1 for normal text
