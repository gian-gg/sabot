# 🎨 Legal Blocks Visual Reference Guide

## Editor Toolbar

```
┌─────────────────────────────────────────────────────────────────────┐
│ [📝 Signature] [👥 Party Info] [📋 Clause] [⚖️ Whereas] [⚡ Terms]   │
│                                                            [🖊️ Add Signature] │
└─────────────────────────────────────────────────────────────────────┘
```

**Design:** Glass morphism (bg-card/50, backdrop-blur), rounded corners, border-border/50

---

## 1️⃣ Signature Block

### Visual Layout:

```
_______________________________
Signature: _______________________
Print Name: _______________________
Date: _______________________
```

### How It Looks in Editor:

```
════════════════════════════════════════════════════════════════
  [Document content above...]
════════════════════════════════════════════════════════════════
[Left margin]
              _______________________________
              Signature: _______________________
              Print Name: _______________________
              Date: _______________________
════════════════════════════════════════════════════════════════
```

### Styling Details:

- **Top border:** 2px solid (var --border)
- **Padding top:** 2rem (16px)
- **Margin top:** 3rem (24px) - creates breathing room
- **Signature line:** 300px wide, 1px bottom border, 40px height
- **Print-safe:** `page-break-inside: avoid` prevents splitting across pages

### Use Cases:

- End of agreement for parties to sign
- Witness signature section
- Notary signature block

---

## 2️⃣ Party Information Block

### Visual Layout:

```
┌─────────────────────────────────────────────────────────────┐
│ Party Information                                           │
│                                                             │
│ Full Legal Name:                                            │
│   [Enter full legal name or entity name]                   │
│                                                             │
│ Address:                                                    │
│   [Street address, City, State, Zip]                       │
│                                                             │
│ Contact Information:                                        │
│   Email: [email address]                                   │
│   [Phone number]                                           │
└─────────────────────────────────────────────────────────────┘
```

### How It Looks in Editor:

```
════════════════════════════════════════════════════════════════
[Left margin]
              ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
              ┃ Party Information                         ┃
              ┃                                           ┃
              ┃ Full Legal Name:                          ┃
              ┃   [Enter full legal name...]              ┃
              ┃   ...more fields...                       ┃
              ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
════════════════════════════════════════════════════════════════
```

### Styling Details:

- **Background:** Primary color 5% tint (soft green glow)
- **Left border:** 4px solid primary green (#01d06c)
- **Padding:** 1.5rem (24px)
- **Margin:** 1.5rem vertical
- **Border radius:** 0.5rem (4px) - subtle rounding
- **Color scheme:** Headings in card-foreground, text in muted-foreground

### Use Cases:

- Define party identities at beginning
- Include legal names, addresses, contacts
- Create separate block for each party (Party A, Party B)

---

## 3️⃣ Clause Block

### Visual Layout:

```
1. [Clause Title]
   [Clause content goes here...]
```

### How It Looks in Editor (with hover):

```
════════════════════════════════════════════════════════════════
[Normal]              │ 1. [Clause Title]
                      │    [Clause content...]
                      │

[Hover]               │ 1. [Clause Title]  ← Left border turns green!
                      │    [Clause content...]
════════════════════════════════════════════════════════════════
```

### Styling Details:

- **Left border:** 3px solid border-color
- **On hover:** Left border transitions to primary green (150ms)
- **Padding left:** 1.5rem (24px)
- **Margin:** 1.5rem vertical
- **Heading color:** card-foreground
- **Transition:** `border-color 150ms ease-out` (smooth)

### Use Cases:

- Define numbered clauses (1, 2, 3...)
- Each clause is a separate block
- Users manually number (future: auto-numbering Phase 4)

### Example Usage:

```
[Click Clause] → Inserts:
1. [Clause Title]
   [Clause content goes here...]

[Edit to]:
1. Scope of Agreement
   This Agreement governs the partnership between
   Party A and Party B for the purpose of...

[Click Clause again] → Inserts:
2. [Clause Title]
   [Clause content goes here...]
```

---

## 4️⃣ Whereas Clause

### Visual Layout:

```
WHEREAS, [state the relevant background fact, condition,
or premise that provides context for the agreement];
```

### How It Looks in Editor:

```
════════════════════════════════════════════════════════════════
[Italicized with left accent]

│ WHEREAS, the parties wish to establish a partnership
│ for the purpose of [describe purpose];
════════════════════════════════════════════════════════════════
```

### Styling Details:

- **Font style:** italic (formal legal language)
- **Color:** muted-foreground (gray)
- **Left border:** 2px solid primary green
- **Padding left:** 1.5rem (24px)
- **Margin:** 1rem vertical
- **Strong text:** Bold, card-foreground color
- **Line height:** 1.6 (readable)

### Use Cases:

- Preamble section ("Recitals")
- Establish context/background
- State mutual intentions
- Typically comes before numbered clauses

### Example Preamble Section:

```
WHEREAS, Party A is engaged in the business of [describe];

WHEREAS, Party B is engaged in the business of [describe];

WHEREAS, the parties desire to establish a partnership
for [purpose];

WHEREAS, the parties desire to set forth the terms and
conditions of their partnership;
```

---

## 5️⃣ Terms & Conditions Block

### Visual Layout:

```
Terms and Conditions

1. [Term 1]: [Description of the first term or condition]

2. [Term 2]: [Description of the second term or condition]

3. [Term 3]: [Description of the third term or condition]
```

### How It Looks in Editor:

```
════════════════════════════════════════════════════════════════
[Boxed section with muted background]

  Terms and Conditions

  1. [Term 1]: [Description...]

  2. [Term 2]: [Description...]

  3. [Term 3]: [Description...]
════════════════════════════════════════════════════════════════
```

### Styling Details:

- **Background:** muted color (slightly darker than default)
- **Padding:** 1.5rem (24px)
- **Margin:** 2rem vertical (significant spacing)
- **Border radius:** 0.5rem (4px)
- **Heading (h2):** 1.5rem, font-weight 700, card-foreground
- **List:** Numbered (ol), margin-left 1.5rem
- **List items:** margin-bottom 1rem
- **Line height:** 1.6

### Use Cases:

- Define main contract terms
- List conditions/obligations
- Can be multiple numbered items
- Often follows clauses/whereas sections

### Example:

```
Terms and Conditions

1. Payment: Party A agrees to pay Party B $[amount]
   for services rendered.

2. Term: This agreement shall commence on [date]
   and continue for [period].

3. Termination: Either party may terminate with
   [notice period] written notice.

4. Confidentiality: Both parties agree to maintain
   strict confidentiality of proprietary information.
```

---

## 🎯 Design System Alignment

### Colors Used:

```
Primary:        #01d06c (bright green accent)
Card Foreground: var(--card-foreground) (nearly white)
Muted Fg:       var(--muted-foreground) (gray)
Border:         var(--border) (dark gray)
Muted:          var(--muted) (very dark)
```

### Spacing Grid (8px base):

```
All padding/margins use multiples of 8px:
- 8px (1 unit)
- 16px (2 units)
- 24px (3 units)
- 32px (4 units)
```

### Transitions:

```
100ms - Fast: Button hovers, placeholder color changes
150ms - Standard: Clause block border color on hover
300ms - Significant: Dialog opens, page transitions
```

### Typography:

```
Signature Block:   font-weight: normal
Party Block:       h3 heading, font-weight: 600
Clause Block:      h4 heading, font-weight: 600
Whereas Clause:    italic, font-weight: normal (strong in bold)
Terms Block:       h2 heading, font-weight: 700
```

---

## 💡 Quick Tips

### Inserting Blocks:

1. **Toolbar button** - Quickest method

   ```
   Click [📝 Signature] → Inserts immediately
   ```

2. **Drag from sidebar** - Intuitive placement
   ```
   Drag "Signature Block" from left → Drop in editor
   ```

### Editing Content:

```
Click any [placeholder text] and edit normally:

[Enter full legal name or entity name]
    ↓ (click and type)
ABC Corporation Inc.
```

### Building a Complete Agreement:

```
Step 1: [Click "Party Info"] → Add both parties
Step 2: [Click "Whereas"] → Add 3-4 preamble clauses
Step 3: [Click "Clause"] → Add "1. Scope"
Step 4: [Click "Clause"] → Add "2. Payment"
Step 5: [Click "Clause"] → Add "3. Term"
Step 6: [Click "Terms"] → Add main terms section
Step 7: [Click "Clause"] → Add "4. Termination"
Step 8: [Click "Signature"] → Add signature blocks
Step 9: [Click "Signature"] → Add witness/notary
Step 10: Edit all [placeholder text] with real content
```

---

## 🖨️ Print Preview

All blocks are optimized for printing:

```
[Print Dialog] Cmd+P / Ctrl+P

Signature blocks: Won't split across pages (page-break-inside: avoid)
Party blocks: Won't split across pages
Clause blocks: Won't split across pages
Terms blocks: Won't split across pages

Result: Professional 1-page or multi-page PDF-ready document
```

---

## ✨ Future Enhancements

### Phase 4: Auto-Numbering

```
Currently:   1. [Clause Title]    ← Manual
             2. [Clause Title]

Future:      1. Scope
             1.1 Definition
             1.2 Requirements
             2. Payment
             2.1 Amount
             2.2 Schedule
```

### Phase 5: Slash Commands

```
Type "/" in editor:

/signature   → Insert signature block
/party       → Insert party info
/clause      → Insert clause
/whereas     → Insert whereas
/terms       → Insert terms
/heading     → Insert heading
/table       → Insert table
```

### Phase 3: PDF Export

```
[Click Export] or Cmd+Shift+E

→ Generates professional PDF
→ Includes all styling
→ Page breaks handled correctly
→ Ready to print or email
```

---

## 🎓 For Developers

### How to Customize Block Styling:

Edit the CSS section in `tiptap-editor.tsx`:

```css
:global(.signature-block) {
  /* Customize here */
  border-top: 2px solid var(--border);
  padding-top: 2rem;
  /* ... */
}
```

### How to Add a New Block:

1. Add template to `legal-commands.ts`:

```typescript
disclaimer: `<div class="disclaimer-block">...</div>`;
```

2. Add insert function:

```typescript
export const insertDisclaimerBlock = (editor: Editor) => {
  editor.chain().focus().insertContent(legalBlockTemplates.disclaimer).run();
};
```

3. Add to toolbar in `tiptap-editor.tsx`:

```tsx
<Button onClick={() => editor && insertDisclaimerBlock(editor)}>
  📋 Disclaimer
</Button>
```

4. Add CSS styling for `.disclaimer-block`

5. Add to legal blocks in `editor-layout.tsx`:

```typescript
{ id: 'legal-disc', title: '📋 Disclaimer', template: 'disclaimer' }
```

---

_This guide covers all visual aspects of the legal blocks implementation._
_All styling follows the design system and is production-ready._
