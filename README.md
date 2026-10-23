# @dinhtan16/tan-editor

Word-like React editor on TipTap 3: A4 pages, tables (merge, borders, cell colors),
images (resize, text wrap), fonts and colors, and dotted tabs (`........` that fill
the line, with text typed on the dots). Private package on GitHub Packages.

## Install

The package is private: you need a GitHub personal access token (classic) with
`read:packages`, from an account that can see `dinhtan16/TanEditor`.

1. In the project that uses it, add to `.npmrc`:

   ```
   @dinhtan16:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${NPM_TOKEN}
   ```

2. Put the token in the environment (shell profile, CI secret), never in git:

   ```bash
   export NPM_TOKEN=ghp_xxx
   ```

3. Install it and its peer dependencies:

   ```bash
   pnpm add @dinhtan16/tan-editor
   pnpm add react react-dom radix-ui lucide-react @tiptap/core @tiptap/pm @tiptap/react @tiptap/starter-kit @tiptap/extension-table @tiptap/extension-text-style @tiptap/extension-text-align @tiptap/extension-highlight @tiptap/extension-image @tiptap/extension-file-handler
   ```

## Use

```tsx
'use client';
import { useState } from 'react';
import TanEditor from '@dinhtan16/tan-editor';
import '@dinhtan16/tan-editor/style.css';

export default function Page() {
    const [html, setHtml] = useState('<p></p>');
    return <TanEditor value={html} onChange={setHtml} height={640} />;
}
```

### Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `value` | `string` | | HTML content |
| `onChange` | `(html: string) => void` | | Called on every edit |
| `height` | `number \| 'fill'` | `640` | Box height in px, or `fill` to grow in a flex parent |
| `className` | `string` | | Extra classes on the editor box |
| `pageSettings` | `PageSettings` | A4 portrait, 25.4mm margins | Page orientation and margins (mm) |
| `contentClassName` | `string` | | Extra classes on the content, e.g. the root class of your print stylesheet |
| `contentCss` | `string` | | CSS added next to the editor, e.g. the stylesheet the HTML is printed with |
| `watermarkHtml` | `string` | | Markup drawn over the page, not saved in the content |
| `toolbarExtra` | `(editor) => ReactNode` | | Your own controls at the end of the toolbar (`ToolbarButton` and `Divider` are exported) |
| `extensions` | `AnyExtension[]` | | Extra TipTap extensions (read once, on mount) |

### Keyboard

| Key | Outside a dotted tab | Inside a dotted tab |
| --- | --- | --- |
| Tab | Insert a dotted tab (in a bordered table: next cell; at the start of a list item: indent) | Next dotted tab, or a new dotted line below |
| Shift+Tab | | Previous dotted tab |
| Enter | New paragraph | New plain line below (leaves the dotted lines) |
| → at the end | | Leave the dotted tab, keep typing on the line |

### Printing the HTML

Dotted tabs are saved as `<span data-tab-leader="dots">…</span>`. If you print or
render the saved HTML outside the editor, add these two rules to that stylesheet:

```css
:is(p, h1, h2, h3, h4, h5, h6):has(> [data-tab-leader]) { display: flex; align-items: baseline; }
[data-tab-leader] { flex: 1 1 0; min-width: 24px; margin: 0 4px; padding: 0 2px; border-bottom: 2px dotted currentColor; overflow-wrap: anywhere; }
```

## Develop

```bash
pnpm install
pnpm dev        # demo page at http://localhost:5180
pnpm typecheck
pnpm build      # dist/index.js, dist/index.d.ts, dist/style.css
```

## Publish

Needs a token with `write:packages` in `NPM_TOKEN`. Bump `version` in `package.json`, then:

```bash
pnpm publish
```

`prepublishOnly` runs the typecheck and the build first.
