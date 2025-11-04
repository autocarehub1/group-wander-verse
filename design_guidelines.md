# WanderTogether Design Guidelines

## Design Approach
**Hybrid Reference-Based**: Drawing from Airbnb's visual richness and card-based layouts combined with Linear's clean typography and Splitwise's expense tracking clarity. Mobile-first execution with touch-optimized interactions.

## Core Design Principles
- **Travel Emotion**: Inspire wanderlust through imagery while maintaining functional clarity
- **Social First**: Design for group dynamics and shared experiences
- **Mobile Command Center**: Every feature accessible within thumb reach on mobile
- **Visual Hierarchy**: Clear information layers preventing cognitive overload

---

## Typography System

**Font Families** (Google Fonts via CDN):
- Primary: 'Inter' (400, 500, 600, 700) - UI, body text
- Accent: 'Playfair Display' (600, 700) - Trip titles, headings

**Type Scale** (Mobile-first):
- Hero/Trip Titles: text-3xl md:text-5xl font-bold (Playfair Display)
- Section Headers: text-xl md:text-2xl font-semibold (Inter)
- Card Titles: text-lg font-semibold
- Body Text: text-base leading-relaxed (16px minimum for mobile)
- Labels/Meta: text-sm font-medium
- Captions: text-xs text-gray-500

---

## Layout & Spacing System

**Tailwind Spacing Units**: Consistently use 3, 4, 6, 8, 12, 16, 20
- Mobile padding: p-4, py-6
- Desktop padding: p-8, py-12, py-20
- Card spacing: p-4 md:p-6
- Element gaps: gap-3, gap-4, gap-6

**Container Strategy**:
- Mobile: px-4 (full-width cards)
- Desktop: max-w-7xl mx-auto px-6

**Grid Patterns**:
- Mobile: Single column (grid-cols-1)
- Tablet: 2 columns (md:grid-cols-2)
- Desktop: 3-4 columns for cards (lg:grid-cols-3, xl:grid-cols-4)

---

## Component Library

### Navigation
**Mobile Bottom Tab Bar** (fixed bottom):
- 4 primary tabs: Trips, Expenses, Messages, Profile
- Icons (Heroicons): Map icon, CreditCard, ChatBubble, UserCircle
- Active state: font-semibold with icon fill
- Height: h-16, safe-area-inset-bottom padding

**Desktop Top Navigation**:
- Horizontal layout with logo left, navigation center, profile/notifications right
- Sticky positioning (sticky top-0)
- Height: h-16 with backdrop-blur

### Hero Section
**Image-First Hero** (Home/Landing):
- Full-width image showcasing group travel (people planning around map, scenic destination)
- Height: 60vh mobile, 70vh desktop
- Overlay: gradient from transparent to dark (gradient-to-b from-transparent via-black/20 to-black/60)
- Content positioned bottom-left: p-6 md:p-12
- Headline: "Plan Adventures Together" (text-4xl md:text-6xl text-white Playfair Display)
- CTA Button: "Start Planning" with backdrop-blur-md bg-white/20 border border-white/30

### Trip Cards
**Primary Card Component**:
- Aspect ratio: aspect-[16/10] (destination image)
- Rounded corners: rounded-xl md:rounded-2xl
- Shadow: shadow-md hover:shadow-xl transition
- Image with gradient overlay at bottom
- Content overlay: absolute bottom-0 p-4
  - Trip name: text-lg font-semibold text-white
  - Date range: text-sm text-white/90
  - Participant avatars: flex overlapping circles (-space-x-2)
  - Budget indicator: text-sm bg-white/20 backdrop-blur px-3 py-1 rounded-full

### Expense Tracking Interface
**Split View Layout**:
- Summary card at top: Total spent, Per person, Settlement status
- Transaction list: Each item shows:
  - Payer avatar (left), Amount (right, bold text-lg)
  - Description (text-base), Category icon
  - Split participants (small avatars, text-xs)
  - Divider between items
- "Add Expense" FAB: fixed bottom-20 right-4, size-16, rounded-full

### Group Messaging
**Chat Interface**:
- Message bubbles: max-w-[75%]
- Own messages: ml-auto bg-blue-500 text-white rounded-2xl rounded-tr-sm
- Others: bg-gray-100 rounded-2xl rounded-tl-sm
- Avatar (others only): size-8 absolute left-0
- Timestamp: text-xs text-gray-400 mt-1
- Input bar: fixed bottom-16 (above tab bar), backdrop-blur, h-14

### Forms & Inputs
**Touch-Optimized**:
- Input fields: h-12 md:h-14 (minimum 44px touch target)
- Labels: text-sm font-medium mb-2
- Border: border-2 focus:border-blue-500 rounded-lg
- Error states: border-red-500 with text-sm text-red-600 below

### Buttons
**Hierarchy**:
- Primary: bg-blue-600 text-white h-12 px-6 rounded-lg font-semibold shadow-sm
- Secondary: border-2 border-gray-300 h-12 px-6 rounded-lg font-semibold
- Text: text-blue-600 font-semibold underline-offset-2
- FABs: rounded-full shadow-lg with icon only

### Invitation System
**Invite Card**:
- Pending state: border-2 border-dashed border-gray-300 p-4 rounded-xl
- Avatar placeholder with "+" icon
- Email input inline with "Send" button
- Accepted invites: solid border, avatar filled, checkmark icon

---

## Images

### Hero Image
**Placement**: Homepage hero section
**Description**: Group of 4-5 diverse friends gathered around a laptop/tablet planning a trip together, with a world map visible, warm natural lighting, casual travel gear (backpacks) in background. Conveys collaboration and excitement about travel.
**Treatment**: Slight blur at edges, warm tone grading

### Trip Card Images
**Quantity**: 6-8 varied destination images
**Examples**: 
- Mountain landscape (Alps/Rockies)
- Beach sunset with palm trees
- European city street (cobblestones, architecture)
- Asian temple/cultural site
- Road trip scenic overlook
- Group hiking trail
**Treatment**: Vibrant colors, slight saturation boost, 16:10 aspect ratio

### Empty States
**Illustrations**: Simple line-art style icons for:
- No trips yet (suitcase icon)
- No expenses (wallet icon)
- No messages (chat bubble icon)
Pair with encouraging text: text-base text-gray-500

---

## Animations
**Minimal & Purposeful**:
- Card hover: transform scale-[1.02] transition duration-200
- Tab transitions: opacity fade only
- Skeleton loading: animate-pulse on card placeholders
- No scroll animations or parallax

---

## Accessibility
- Minimum touch targets: 44x44px (h-11 minimum)
- Contrast ratio: 4.5:1 minimum for all text
- Focus states: ring-2 ring-blue-500 ring-offset-2
- Screen reader labels on all icon-only buttons
- Semantic HTML maintained throughout