# Decompress Branding Assets

## Logo

The Decompress logo is located at `/public/assets/images/decompress.png` (684x365px).

The logo features:
- A flowing, dynamic figure design in blues and teals representing movement and leisure
- "DECOMPRESS" wordmark in deep navy (matching brand color `#123B60`)
- Tagline: "PUBLIC RELATIONS | EVENTS | LEISURE BOOKING"

### Usage in Code

The logo is displayed in the header using Next.js Image component:

```tsx
<Image
  src="/assets/images/decompress.png"
  alt="Decompress"
  width={180}
  height={96}
  priority
  className="h-10 sm:h-12 w-auto"
/>
```

## Favicons

Favicons are automatically generated from the logo using the `generate-favicons` script.

### Generated Files

- **`app/icon.png`** (32×32) - Browser favicon
- **`app/apple-icon.png`** (180×180) - Apple touch icon for iOS devices
- **`app/opengraph-image.png`** (1200×630) - Social media sharing preview image

### Regenerating Favicons

If you update the logo, regenerate favicons by running:

```bash
npm run generate-favicons
```

This script uses the Sharp image processing library to:
1. Resize the logo to appropriate dimensions
2. Add proper padding/backgrounds
3. Optimize for web delivery

### Next.js Automatic Serving

Next.js 15 App Router automatically serves these special files:
- `/icon.png` → browser favicon
- `/apple-icon.png` → Apple devices
- `/opengraph-image.png` → Open Graph social previews

No additional configuration needed—just place the files in the `app/` directory.

## Open Graph & Social Sharing

Social media preview cards are configured in `app/layout.tsx`:

```typescript
openGraph: {
  title: 'Decompress | Social Experience Discovery & Venue Booking',
  description: '...',
  images: [{
    url: '/opengraph-image.png',
    width: 1200,
    height: 630,
  }],
}
```

This ensures that when links to Decompress are shared on social platforms (Twitter, Facebook, LinkedIn, WhatsApp), they display a branded preview card with the logo.

## Color Palette

The logo incorporates the brand colors:
- Deep Navy (`#123B60`) - Primary wordmark
- Blues and Teals - Dynamic figure design matching `#13A6A3` brand teal
- White/Light backgrounds aligning with surface color (`#F5F8FA`)

See `docs/DESIGN.md` for complete brand color specifications.
