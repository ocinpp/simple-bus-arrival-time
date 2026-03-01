# Bottom Sheet Pattern on Mobile

## What is a Bottom Sheet?

A **bottom sheet** is a UI panel that slides up from the bottom of the screen. It's a common mobile pattern used by Google Maps, Apple Maps, Uber, and most modern mobile apps. It replaces inline dropdowns and modals on small screens where they tend to cause scroll conflicts and are hard to interact with.

## Why We Used It

The original `SearchableSelect` component used an **inline dropdown** (absolutely positioned below the input). On mobile, this caused problems:

- **Scroll conflicts** — scrolling the dropdown list would scroll the page behind it
- **Accidental selection** — `@pointerdown.prevent` was used to prevent blur-on-click, but it also made scroll gestures trigger selection
- **Keyboard overlap** — when the search input was focused, the virtual keyboard covered the dropdown options
- **Small touch targets** — dropdown items were too small to tap reliably

The bottom sheet solves all of these by taking over the full screen.

## Implementation

### Dual-mode Component

The `SearchableSelect.vue` component renders differently based on screen width:

```
Desktop (≥768px) → Inline dropdown (absolute positioned below input)
Mobile  (<768px) → Full-screen bottom sheet (teleported to <body>)
```

### Key Code Patterns

#### 1. Screen Detection

```ts
const isMobile = ref(false);

function checkMobile() {
    isMobile.value = window.innerWidth < 768;
}

onMounted(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
});
```

#### 2. Teleport to `<body>`

The bottom sheet is teleported outside the component tree to avoid being clipped by parent `overflow` or `z-index` stacking contexts:

```html
<teleport to="body">
    <div v-if="isOpen && isMobile" class="fixed inset-0 z-[100]">
        <!-- backdrop + sheet content -->
    </div>
</teleport>
```

#### 3. Body Scroll Lock

When the sheet is open, the background page must not scroll:

```ts
watch(isOpen, (val) => {
    if (val && isMobile.value) {
        document.body.style.overflow = "hidden";
    } else if (isMobile.value) {
        document.body.style.overflow = "";
    }
});
```

#### 4. Touch Scroll Containment

The options list uses `overscroll-contain` to prevent scroll chaining (where scrolling past the end of the list would scroll the page behind it):

```html
<div class="overflow-y-auto overscroll-contain">
    <!-- options -->
</div>
```

#### 5. Readonly Input on Mobile

On mobile, the trigger input is `readonly` so tapping it opens the bottom sheet instead of the keyboard. The sheet has its own search input:

```html
<input :readonly="isMobile" @click="open" />
```

#### 6. Touch-Friendly Targets

Each option has a minimum height of 44px (Apple's recommended minimum touch target size):

```html
<div style="min-height: 44px; display: flex; align-items: center;">
    {{ option.label }}
</div>
```

#### 7. Safe Area Insets

For phones with notches or gesture bars, the list respects the safe area:

```html
<div class="pb-[env(safe-area-inset-bottom,1rem)]">
```

## Structure

```
┌──────────────────────────┐
│      Dark Backdrop       │  ← @click="close"
│  ┌────────────────────┐  │
│  │    ── Handle ──    │  │  ← Visual affordance
│  │  ┌──────────────┐  │  │
│  │  │ Search input  │  │  │  ← Auto-focused, inputmode="search"
│  │  └──────────────┘  │  │
│  │  ┌──────────────┐  │  │
│  │  │ Option 1     │  │  │  ← 44px min-height
│  │  │ Option 2 ✓   │  │  │  ← Selected highlight
│  │  │ Option 3     │  │  │
│  │  │ ...          │  │  │  ← Scrollable, overscroll-contain
│  │  └──────────────┘  │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

## Gotchas & Lessons Learned

### 1. `flex-1` needs `min-h-0`
In a flex column layout, `flex-1` children don't shrink below their content size by default. You need `min-h-0` on the parent for `overflow-y-auto` to work on the child.

### 2. Backdrop steals touch events
An `absolute inset-0` backdrop sits on top of sibling content. The sheet needs `z-10` (or higher) to receive touch events above the backdrop.

### 3. Android Autofill Bar
Android shows an autofill suggestion bar (key, credit card, location icons) above the keyboard. Suppress it with:
```html
<input inputmode="search" autocomplete="off" />
```

### 4. `@pointerdown.prevent` breaks scrolling
Using `@pointerdown.prevent` on list items prevents the browser's default scroll behavior. Use `@click` instead on mobile — it doesn't interfere with scrolling.

### 5. IDE auto-formatter vs ESLint
The formatter may convert `<input>` to `<input />` (self-closing), conflicting with `vue/html-self-closing`. Disable the rule if the formatter wins:
```js
rules: { "vue/html-self-closing": "off" }
```

## References

- [Material Design — Bottom Sheets](https://m3.material.io/components/bottom-sheets/overview)
- [Apple HIG — Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)
- [MDN — Visual Viewport API](https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API)
- [MDN — overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior)
- [MDN — env() safe-area-inset](https://developer.mozilla.org/en-US/docs/Web/CSS/env)
- [Vue — Teleport](https://vuejs.org/guide/built-ins/teleport)

