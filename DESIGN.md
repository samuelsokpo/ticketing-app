# DESIGN.md — Master Design System & Brand Guidelines

> **IMPORTANT ENFORCEMENT LOOP**: Any subagent, developer, or design iteration MUST read this file and [`JOURNAL.md`](file:///Users/samuels.okpo/ticketing-app/JOURNAL.md) before writing or updating UI code. No generic AI templates, placeholder vectors, or standard bootstrap components are allowed.

---

## 1. Core Visual Aesthetics & Design Philosophy

The platform is designed as an **editorial, futuristic event-ticketing engine** combining the dark glassmorphic dashboard elegance of modern streaming platforms, high-fashion editorial photography, and cybernetic interactive venue seating/pass systems.

### Design Pillars
1. **Brand Identity**: The official **OKPO** branding uses the signature vivid purple (`#9333EA` / `#A855F7`) derived from the official OKPO logo wedge mark.
2. **Editorial High-Fashion Photography**: All human imagery features Black / African models with warm film-grain textures, authentic studio/lifestyle lighting, high fashion attire, and human emotion. **Zero generic AI clip-art, stock illustrations, or standard vectors.**
3. **Glassmorphic Dark Slate Architecture**: Ultra-deep slate backgrounds (`#0B0D12`, `#12151E`) layered with frosted glass panels (`backdrop-blur-2xl`), subtle borders (`border-white/10`), and floating ambient purple glows.
4. **NuMetro Interactive Seating & Tier Grid**: Interactive cinema-inspired seat maps, showtime chips, dynamic tier badges (BALENCIAGA, WOZA, KALAKUTA, BAD), and real-time seat status indicators (Vivid Purple `#9333EA` = Selected/Available, Dark Slate `#262C3A` = Standard, Crimson `#FF3B30` = Sold Out).
5. **Cinematic Typography & Motion**: Ultra-clean sans-serif (Inter) mixed with sharp serif accent headers (Syne), micro-spring hover animations, scanline glows, and high-contrast readable hierarchy.

---

## 2. Color Palette & Visual Tokens

| Token Name | HEX / Value | Application |
| :--- | :--- | :--- |
| **Canvas Slate** | `#0B0D12` | Main page background void |
| **Panel Glass Top** | `rgba(18, 22, 32, 0.75)` | Floating dashboard containers & cards |
| **Glass Border** | `rgba(255, 255, 255, 0.08)` | Subtly defining card edges & separators |
| **Okpo Purple** | `#9333EA` | Primary brand accent, selected seats, primary ticket CTA |
| **Okpo Purple Light**| `#A855F7` | Hover states, glowing badges, accent text |
| **Okpo Purple Dark** | `#7E22CE` | Gradient bottoms, pressed button states |
| **Crimson Sold Out** | `#FF3B30` | Taken seats, urgent notifications, sold out badges |
| **Editorial Gold** | `#E5C07B` | VIP Tiers, premium membership badges, luxury highlights |
| **Purple Ambient Glow** | `rgba(147, 51, 234, 0.25)` | Background ambient lighting, button glow shadows |

---

## 3. Reference System & Visual Layout Rules

### Layout Blueprint
* **Top Navigation Bar**: Fixed glass navbar with OKPO logo badge, nav anchor links, search shortcut, and Sign In / Dashboard direct link.
* **Hero Event Section ("Cinematic Opening")**:
  * Full-bleed speedramp ticket-catch photograph with Ken Burns slow zoom.
  * Floating holographic 3D ticket pass with shimmer animation.
  * High-converting headline + CTA to jump directly to featured events.
* **Featured Event Spotlight (Immediately below Hero)**:
  * Full-width 21:9 card featuring **King Jfly Live In Concert** at The Arena Event Center.
  * Right: Cutout portrait of King Jfly overlaid on the stage atmosphere.
  * Left: Event metadata, date (Sun, 20 Sept · 18:00), venue, ticket tiers (`BALENCIAGA ₦5,000`, `WOZA ₦20,000`, `KALAKUTA ₦500,000`, `BAD ₦1,000,000`), and live pulsing `TICKETS LIVE` badge.
* **NuMetro Seating Grid**:
  * Date picker tabs, tier selector pills, stage arc, interactive matrix, and real-time total reservation calculator.
* **User Dashboard & Auth Flow**:
  * `/auth`: Split-screen editorial sign-in page with Google OAuth and Email options.
  * `/dashboard`: Clean dark statistics layout showing Tickets Bought, Upcoming Events, Total Money Spent, and a Milestone Trackboard (Bronze → Silver → Gold → Diamond).

---

## 4. Model Representation Guidelines

* **Model Sample**: African American / Black model archetype and artist portraits (natural hair/locs, high-fashion styling, warm ambient lighting, editorial lifestyle aesthetic).
* **Usage Context**: Used across event banners, VIP backstage pass marketing, hero editorial sections, and user avatar states.
* **Image Treatment**: Warm color grading, subtle film grain, natural skin tones, high editorial sharpness, and no artificial plastic smoothing.

---

## 5. Subagent & Developer Remembrance Loop

Every time UI code is evaluated or modified, verify:
1. [ ] Is the page using dark slate frosted glass panels (`#0B0D12` canvas + `backdrop-blur-2xl`)?
2. [ ] Are all imagery assets high-resolution editorial photography featuring Black models/artists?
3. [ ] Does the ticket purchasing UI feature the NuMetro cinema-style interactive seat map and showtime pill selectors?
4. [ ] Are colors centered around Okpo Purple (`#9333EA`), Sold Out Crimson (`#FF3B30`), and Editorial Gold (`#E5C07B`)?
5. [ ] Is the brand logo present and correctly displayed?
6. [ ] Is there zero generic AI placeholder art?

*(Refer to `JOURNAL.md` for full change history and recorded iterations).*
