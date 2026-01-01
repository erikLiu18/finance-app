# Credit Card Due Date Tracking - Design Doc

## 1. Overview
A feature to track credit card due dates and send notifications (Email/SMS) to users X days before the due date.

## 2. User Stories
- **Add Card**: As a user, I want to add a credit card with a nickname (e.g., "Chase Sapphire") and a due day (e.g., "15th of every month").
- **Notification Settings**: As a user, I want to toggle Email or SMS alerts for each card.
- **Timing**: As a user, I want to set how many days before the due date I should be notified (e.g., "Notify me 3 days before").
- **Dashboard**: As a user, I want to see a list of my cards sorted by upcoming due dates.

## 3. Data Model (Proposed)

### `credit_cards` Table
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `user_id` | String | Clerk User ID |
| `name` | String | e.g. "Amex Gold" |
| `due_day` | Integer | 1-31 |
| `notify_email` | Boolean | Default: false |
| `notify_sms` | Boolean | Default: false |
| `phone_number` | String | Optional (if different from profile) |
| `notify_days_before` | Integer | e.g. 3 |
| `created_at` | Timestamp | |

## 4. Architecture & Logic

### Notification Engine
Since Next.js is serverless, we need a reliable way to check for due dates every day.
- **Option A: Cron Job (Vercel Cron / Railway Cron)**: A scheduled endpoint `/api/cron/check-due-dates` that runs once a day (e.g., 9 AM UTC).
- **Logic**:
    1. Query DB for cards where `(today + notify_days_before).day == due_day`.
    2. Send emails via **Resend** (recommended for Next.js).
    3. Send SMS via **Twilio**.

## 5. UI Components
- **Card List**: A table or grid view of cards.
- **Add/Edit Modal**: Shadcn Dialog with a form (using `react-hook-form` + `zod` schema).
    - Inputs: Name, Due Day (Select 1-31), Checkboxes for Notify Email/SMS, Input for "Days Before".

## 6. Questions / Decisions
1.  **Database**: We need to set up the Postgres DB (Prisma or Drizzle?).
2.  **Email Provider**: Do we use Resend? (Free tier is great).
3.  **SMS Provider**: Twilio? (Cost money usually, or verify numbers in trial).
