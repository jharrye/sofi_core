# SOFI TE ACOMPAÑA - Setup README

Complete emotional companion PWA with futuristic interface and AI-powered conversations.

## Quick Start

### 1. Database Setup (Supabase)

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the schema migrations:
   ```sql
   -- In Supabase SQL Editor, run in order:
   -- 1. supabase/companion_schema.sql
   -- 2. supabase/companion_seed.sql (optional, for testing)
   ```

### 2. Install Dependencies

```bash
cd sofi-app
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - From Supabase Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` - From Supabase Settings → API (secret!)
- `STRIPE_SECRET_KEY` - From Stripe Dashboard
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - From Stripe Dashboard
- `STRIPE_WEBHOOK_SECRET` - After setting up Stripe webhook
- `OPENAI_API_KEY` - From OpenAI Dashboard

### 4. Stripe Setup

1. Create products in Stripe:
   - Monthly Plan
   - Annual Plan
2. Copy Price IDs to `.env.local`
3. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Copy webhook secret to `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
sofi-app/
├── app/
│   ├── page.tsx                    # Home screen (non-chat interface)
│   ├── layout.tsx                  # Root layout with PWA config
│   ├── globals.css                 # Global styles
│   ├── api/
│   │   ├── sofi/respond/route.ts   # Main AI endpoint
│   │   └── webhooks/stripe/route.ts # Stripe webhook handler
│   ├── interact/                   # Conversation interface
│   ├── auth/                       # Login/signup
│   └── paywall/                    # Subscription management
├── components/
│   ├── avatar/                     # Sofi & Sam avatars
│   ├── ui/                         # Design system (Card, Button)
│   └── animations/                 # Motion components
├── lib/
│   ├── supabase/client.ts          # Supabase client & helpers
│   ├── stripe/config.ts            # Stripe configuration
│   └── design/theme.ts             # Design tokens
└── public/
    └── manifest.json               # PWA manifest
```

## Key Features

### 🎨 Futuristic UI/UX
- Non-chat interface (not like ChatGPT/WhatsApp)
- Glassmorphism effects
- Breathing avatar animations
- Theme-aware (Sofi warm / Sam cool)
- Mobile-first PWA

### 🧠 Intelligent Memory
- Context-aware conversations
- Memory facts (max 30 per user)
- Auto-generated session summaries
- Priority-based fact retention

### 💳 Subscription Management
- 15-day automatic trial
- Stripe integration (monthly/annual)
- Automatic paywall on expiration
- Webhook-based status updates

### 🤖 Dual Personalities
- **Sofi**: Warm, empathetic, reflective
- **Sam**: Direct, structured, clear

## Database Schema

### Key Tables
- `profiles` - User profiles with avatar & style preferences
- `subscriptions` - Trial & Stripe subscription management
- `conversations` - Conversation sessions
- `messages` - Chat history
- `session_summaries` - AI-generated summaries
- `memory_facts` - Important user facts (max 30)

### Helper Functions
- `has_active_access()` - Check if user has valid trial/subscription
- `enforce_memory_limit()` - Auto-evict old facts when limit reached
- `handle_new_user()` - Auto-create profile + trial on signup

## API Endpoints

### POST /api/sofi/respond
Main AI conversation endpoint.

**Request:**
```json
{
  "userId": "uuid",
  "conversationId": "uuid",
  "userMessage": "text"
}
```

**Response:**
```json
{
  "response": "AI response text",
  "messageCount": 14
}
```

**Features:**
- Subscription check
- Context loading (messages, memory, summaries)
- Personality-aware prompts
- Auto-summary generation (every ~7 messages)

### POST /api/webhooks/stripe
Stripe webhook handler.

**Events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

## Deployment

### Vercel (Recommended)

```bash
npm run build
# Connect to Vercel and deploy
```

### Environment Variables
Ensure all production keys are set in Vercel dashboard.

### Stripe Webhook
Update webhook URL to production domain in Stripe dashboard.

## Design Philosophy

### NOT a Chat App
This is NOT a traditional chat interface. It's a companion space.

**Avoid:**
- WhatsApp-style bubbles
- ChatGPT-like interfaces
- Technical/robotic feel

**Embrace:**
- Futuristic aesthetics
- Emotional design
- Premium feel
- Calm, spacious layouts

### Mobile First
- Designed for mobile primarily
- PWA installable
- Offline-ready (basic)
- Touch-optimized

## Customization

### Change AI Provider
Edit `app/api/sofi/respond/route.ts`:
```typescript
// Replace OpenAI with Anthropic/etc
import Anthropic from '@anthropic-ai/sdk';
```

### Adjust Memory Limit
Edit `supabase/companion_schema.sql`:
```sql
-- Change 30 to your desired limit
IF v_count >= 30 THEN
```

### Modify Personalities
Edit system prompts in `app/api/sofi/respond/route.ts` → `buildSystemPrompt()`

## Troubleshooting

### Trial Not Working
Check `has_active_access()` function in database.

### Stripe Webhook Failing
Verify webhook secret in `.env.local` matches Stripe dashboard.

### AI Not Responding
Check OpenAI API key and quota.

### PWA Not Installing
Verify `manifest.json` and icons are accessible.

## Next Steps

1. [ ] Add auth pages (login/signup)
2. [ ] Build interaction screen
3. [ ] Create paywall component
4. [ ] Add feelings/exercise/library pages
5. [ ] Generate PWA icons
6. [ ] Deploy to production
7. [ ] Set up monitoring

## License

Proprietary - SOFI TE ACOMPAÑA
