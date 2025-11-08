# SetorCuan Project Structure

## Root Directory
\`\`\`
setorcuan/
├── app/                          # Next.js 16 App Router
│   ├── (auth)/                   # Auth layout group
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (protected)/              # Protected routes layout group
│   │   ├── dashboard/page.tsx
│   │   ├── tukar-sampah/page.tsx
│   │   ├── tukar-poin/page.tsx
│   │   └── history-transaksi/page.tsx
│   ├── admin/page.tsx            # Admin dashboard
│   ├── prices-locations/page.tsx # Public page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
│
├── components/                   # Reusable React components
│   ├── ui/                       # shadcn/ui components (auto-generated)
│   ├── layouts/                  # Layout components
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   ├── forms/                    # Form components
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   ├── tukar-sampah-form.tsx
│   │   └── tukar-poin-form.tsx
│   ├── cards/                    # Card components
│   │   ├── stat-card.tsx
│   │   └── transaction-card.tsx
│   ├── modals/                   # Modal/dialog components
│   │   └── location-selector.tsx
│   ├── maps/                     # Maps components
│   │   └── google-map.tsx
│   ├── private-route.tsx         # Protected route wrapper
│   └── theme-provider.tsx        # Theme context
│
├── lib/                          # Utility functions & stores
│   ├── auth-store.ts             # Zustand auth store
│   ├── transaction-store.ts      # Transaction management
│   ├── fonnte.ts                 # Fonnte API utils
│   ├── maps.ts                   # Google Maps utils
│   ├── utils.ts                  # General utilities
│   └── constants.ts              # App constants
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts
│   ├── use-toast.ts
│   ├── use-auth.ts               # Auth hook
│   └── use-transaction.ts        # Transaction hook
│
├── styles/                       # Global styles (alternative)
│   └── globals.css
│
├── public/                       # Static assets
│   ├── manifest.json             # PWA manifest
│   ├── icons/                    # App icons
│   ├── images/                   # Images
│   └── fonts/                    # Custom fonts
│
├── scripts/                      # Utility scripts
│   ├── generate-pwa.js           # PWA generation
│   └── seed-data.js              # Mock data seeding
│
├── types/                        # TypeScript types
│   ├── auth.ts
│   ├── transaction.ts
│   ├── user.ts
│   └── location.ts
│
├── config/                       # Configuration files
│   ├── app.config.ts             # App config
│   ├── navigation.ts             # Navigation routes
│   └── mock-data.ts              # Mock data
│
├── .env.local                    # Local environment variables
├── next.config.mjs               # Next.js config (PWA)
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind CSS config
├── postcss.config.mjs            # PostCSS config
├── package.json                  # Dependencies
└── README.md                     # Project documentation
\`\`\`

## Folder Organization Guidelines

### `/app`
- Use route groups `(auth)` and `(protected)` for layout organization
- Keep pages simple, delegate logic to components

### `/components`
- Organized by feature/type
- Each component in its own file
- Re-exports via `index.ts` for cleaner imports

### `/lib`
- Zustand stores for state management
- API utility functions (Fonnte, Maps, etc)
- Helper functions

### `/types`
- TypeScript interfaces and types
- Organized by domain (auth, transactions, etc)

### `/hooks`
- Custom React hooks
- Naming convention: `use-*`

### `/public`
- Static assets
- PWA manifest and icons

## Import Conventions

\`\`\`tsx
// ✅ DO - Absolute imports
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { authStore } from '@/lib/auth-store'
import type { User } from '@/types/auth'

// ❌ DON'T - Relative imports
import { Button } from '../../../components/ui/button'
\`\`\`

## File Naming

- Components: `PascalCase` (e.g., `LoginForm.tsx`)
- Pages: `lowercase` with hyphens (e.g., `tukar-sampah`)
- Utilities: `lowercase` with hyphens (e.g., `auth-store.ts`)
- Types: `lowercase` with hyphens (e.g., `auth.ts`)
