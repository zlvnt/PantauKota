```markdown
# Design System Specification: Civic Clarity

## 1. Overview & Creative North Star
**Creative North Star: "The Editorial Ledger"**
This design system moves beyond the "generic dashboard" by treating environmental data with the prestige of a high-end architectural journal. We reject the cluttered "widget" aesthetic in favor of **The Editorial Ledger**—a philosophy that prioritizes intentional whitespace, typographic authority, and tonal layering. 

While the user's foundation is "Minimalist," our execution is **Sophisticated Utility**. We break the "template" look through a rhythmic use of negative space and a "No-Line" architectural approach, ensuring that 'PantauKota' feels less like a database and more like a curated command center for civic progress.

---

## 2. Colors: Tonal Architecture
The palette is rooted in atmospheric neutrals, using muted greens and teals as precise surgical accents rather than decorative flourishes.

### Surface Hierarchy & Nesting
We do not use borders to define structure. Depth is achieved through **Tonal Layering**.
- **Base Layer:** `surface` (#f7f9fb) – The canvas.
- **Sectional Layer:** `surface_container_low` (#f0f4f7) – Used for large sidebar or grouping areas.
- **Action Layer:** `surface_container_lowest` (#ffffff) – Used for primary interactive cards to provide a "natural lift."
- **Focus Layer:** `surface_container_high` (#e1e9ee) – Reserved for recessed utility bars or active states.

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** Boundaries must be defined solely through background color shifts. A list of reports should sit on `surface_container_lowest` against a `surface_container_low` background. 

### Signature Textures & Glassmorphism
To elevate the "Modern" requirement, use **Glassmorphism** for floating overlays (Modals, Hover Menus):
- **Token:** `surface` at 80% opacity with a `backdrop-filter: blur(12px)`.
- This ensures the UI feels like a series of physical layers rather than a flat digital screen.

---

## 3. Typography: The Authority of Sans
We utilize a dual-font strategy to balance character with data-heavy readability.

| Category | Font | Role |
| :--- | :--- | :--- |
| **Display/Headline** | **Manrope** | Bold, geometric, and authoritative. Used for page titles and high-level metrics. |
| **Body/Title/Label** | **Inter** | Highly legible, neutral, and functional. Used for all data entry, report descriptions, and navigation. |

**Scale Intent:** 
- Use `display-md` for "Total Laporan" numbers to give environmental data a sense of scale.
- Use `label-sm` in all-caps with `0.05em` letter spacing for metadata (e.g., "TANGGAL LAPORAN") to mimic editorial captioning.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are replaced by **Ambient Depth**.

- **The Layering Principle:** Instead of a drop shadow, a card (`surface_container_lowest`) is placed inside a section (`surface_container_low`). The 2% shift in brightness is sufficient for the human eye to perceive hierarchy without visual noise.
- **The "Ghost Border" Fallback:** If a container requires definition against an identical background, use a `1px` stroke of `outline_variant` (#a9b4b9) at **15% opacity**. This creates a "suggestion" of a boundary rather than a hard line.
- **Ambient Shadows:** Only for elevated components (e.g., dropdowns). 
    - `box-shadow: 0 8px 30px rgba(42, 52, 57, 0.06);` (Using `on_surface` color as the shadow base).

---

## 5. Components: The Industrial Primitive

### Buttons (Tombol)
- **Primary:** `primary` (#426464) background with `on_primary` text. No rounded corners beyond `md` (0.375rem) to maintain a crisp, professional look.
- **Secondary:** `surface_container_highest` background. No border.
- **Tertiary:** Transparent background, `primary` text. Use for low-emphasis actions like "Batal."

### Input Fields (Kolom Input)
- **Style:** Understated. Use `surface_container_low` as the background with a 1px "Ghost Border." 
- **Focus State:** Transitions to a 1px `primary` border. No "glow" effects.

### Cards & Lists (Kartu & Daftar)
- **The Divider Rule:** **Forbid 1px horizontal lines.** 
- To separate report items, use `8px` of vertical whitespace or a subtle background toggle between `surface_container_lowest` and `surface` on hover.

### Progress Indicators (Status Lingkungan)
- Use `tertiary` (#006d4a) for "Selesai" (Resolved).
- Use `primary_dim` (#365858) for "Dalam Proses" (In Progress).
- Use `error` (#9f403d) for "Mendesak" (Urgent).

---

## 6. Do's and Don'ts (Panduan Praktis)

### Do
- **Gunakan Spasi Berlebih:** Give data room to breathe. Increase line-height in reports to `1.6` for better legibility.
- **Gunakan Ikon Outlined:** Use 1.5pt stroke icons only. Avoid filled icons unless they represent an "active" navigation state.
- **Hierarki Tonal:** Always check if a background color change can replace a border.

### Don'ts
- **Jangan Gunakan Bayangan Pekat:** Avoid any shadow that is visible as "grey." Shadows must feel like ambient light.
- **Jangan Gunakan Gradien:** Keep all surfaces flat or glass-morphic. The "soul" of the design comes from the color palette, not effects.
- **Jangan Gunakan Divider Line:** Avoid the "Excel" look. Use grouping and padding to separate data points.

---

## 7. Language & Tone (Bahasa)
The system uses **Bahasa Indonesia Baku** to maintain professional civic authority.
- **Button Labels:** "Simpan Perubahan" instead of "Save."
- **Empty States:** "Belum ada laporan masuk" instead of "Tidak ada data."
## 8. Specific UI Behaviors

### Priority System (PBI-12)
- **Visual Flagging**: Laporan prioritas (darurat) ditandai dengan badge "🔥 Prioritas Darurat" (red-100 bg, red-700 text).
- **Admin Management**: Di halaman Kelola Laporan, laporan yang diprioritaskan memiliki border-left tebal berwarna merah (`border-l-4 border-red-500`) dan tombol toggle prioritas (Flag icon) yang berubah menjadi merah jika aktif.
- **Score Calculation**: Skor prioritas dihitung secara dinamis via rumus `(voteCount * 2) + hari_berlalu`.

### Status Tracking Timeline (PBI-11)
- **Timeline Nodes**: Node diwarnai sesuai status: 
  - `MENUNGGU`: Amber (`bg-amber-100`, `text-amber-600`) dengan ikon jam.
  - `DIPROSES`: Biru (`bg-blue-100`, `text-blue-600`) dengan animasi spinner (loading).
  - `SELESAI`: Hijau (`bg-green-100`, `text-green-700`) dengan ikon centang.
- **Admin Feedback**: Saat status selesai, catatan admin dan foto penyelesaian ditampilkan dalam blok hijau khusus (`bg-green-50` dengan border `border-green-100`).