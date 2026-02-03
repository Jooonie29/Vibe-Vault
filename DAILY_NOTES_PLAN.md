# Daily Notes Modal Enhancement Plan

## Overview
Transform the current ProjectNoteModal from a simple textarea into a rich text editor with formatting tools, making it more powerful for daily progress tracking and note-taking.

## Proposed Features

### 1. Text Formatting Tools
**Basic Formatting:**
- **Bold** (Ctrl+B) - Toggle bold text
- *Italic* (Ctrl+I) - Toggle italic text
- <u>Underline</u> (Ctrl+U) - Toggle underline
- ~~Strikethrough~~ - Cross out completed tasks
- `Code` - Inline code formatting

**Heading Styles:**
- H1, H2, H3 - Different heading levels for structure
- Normal text - Default paragraph style

### 2. List Formatting
- **Bullet Points** - Unordered lists for general notes
- **Numbered Lists** - Ordered lists for sequential tasks
- **Checkboxes** - Todo lists with [ ] and [x] support
- **Nested Lists** - Indent/outdent functionality

### 3. Advanced Features
**Insert Options:**
- Links (Ctrl+K) - Add hyperlinks to resources
- Images - Upload or paste images into notes
- Code Blocks - Syntax-highlighted code snippets
- Tables - Simple tables for structured data
- Horizontal Rules - Section dividers

**Editing Tools:**
- Undo/Redo (Ctrl+Z / Ctrl+Y)
- Clear Formatting - Remove all formatting
- Text Color - Change text color
- Background Color - Highlight important text
- Alignment - Left, center, right, justify

### 4. Smart Features
**Auto-formatting:**
- Auto-convert "- " to bullet points
- Auto-convert "1. " to numbered lists
- Auto-convert "[] " to checkboxes
- Markdown shortcuts (e.g., **text** → bold)

**Date/Time Integration:**
- Auto-insert current date/time
- @mentions for team members
- #tags for categorization

### 5. UI/UX Improvements
**Toolbar Design:**
```
┌─────────────────────────────────────────────────────┐
│ B I U S │ H1 H2 H3 │ • 1. ☑ │ 🔗 📷 │ ↔ ↔ ↔ │ 🎨 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Rich text editing area with formatting support     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Floating toolbar (like Notion/Medium)
- Slash commands (/bold, /list, etc.)
- Bubble menu on text selection
- Keyboard shortcuts display
- Auto-save indicator
- Word/character count

### 6. Implementation Options

**Option A: Rich Text Editor Library (Recommended)**
- **TipTap** - Headless, extensible, React-friendly
- **Pros:** Highly customizable, good performance, active community
- **Cons:** Requires setup and configuration

**Option B: Markdown Editor**
- **React-Markdown** with live preview
- **Pros:** Simple, portable format, developer-friendly
- **Cons:** Less WYSIWYG, steeper learning curve

**Option C: ContentEditable + Custom**
- Build custom solution
- **Pros:** Full control, lightweight
- **Cons:** Complex, edge cases with contenteditable

### 7. Recommended Implementation: TipTap

**Setup:**
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
```

**Extensions to Include:**
- Starter Kit (bold, italic, lists, etc.)
- Placeholder - Show hint text when empty
- Link - Add hyperlinks
- Image - Insert images
- Code Block Lowlight - Syntax highlighting
- Table - Simple tables
- Task List - Checkboxes
- Text Align - Alignment options
- Color - Text and background colors
- History - Undo/redo

**Component Structure:**
```typescript
// ProjectNoteModal.tsx
- EditorToolbar (formatting buttons)
- EditorContent (TipTap editor)
- EditorBubbleMenu (floating menu on selection)
- EditorSlashMenu (command palette)
```

### 8. Database Changes
**Current:**
```typescript
notes?: string; // Plain text
```

**New:**
```typescript
notes?: string; // HTML or JSON content
notesFormat?: 'html' | 'json' | 'markdown'; // Format indicator
lastEditedAt?: string; // Track edits
```

**Migration:**
- Existing plain text notes remain as-is
- New notes stored as HTML
- Display plain text as HTML (wrap in <p>)

### 9. UI Mockup

```
┌────────────────────────────────────────────────────────────┐
│  Project Progress Note                              [×]    │
├────────────────────────────────────────────────────────────┤
│  📄 Add your daily progress for "Project Name"             │
├────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  B  I  U  S  │  H1  H2  │  •  1.  ☑  │  🔗  📷  🎨  │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │  ## Today Accomplishments                          │   │
│  │                                                     │   │
│  │  • [x] Fixed login bug                             │   │
│  │  • [ ] Update documentation                        │   │
│  │  • [ ] Code review                                 │   │
│  │                                                     │   │
│  │  **Blockers:**                                     │   │
│  │  Waiting for API credentials from DevOps team     │   │
│  │                                                     │   │
│  │  [Screenshot of progress chart]                    │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  💾 Auto-saved 2 minutes ago        245 words              │
├────────────────────────────────────────────────────────────┤
│  [Cancel]                    [Save Note]                   │
└────────────────────────────────────────────────────────────┘
```

### 10. Implementation Steps

**Phase 1: Basic Setup (1-2 days)**
1. Install TipTap dependencies
2. Create basic editor component
3. Replace textarea with editor
4. Test basic text input

**Phase 2: Toolbar (2-3 days)**
1. Create toolbar component
2. Add basic formatting buttons (bold, italic, lists)
3. Implement keyboard shortcuts
4. Add placeholder text

**Phase 3: Advanced Features (3-4 days)**
1. Add link insertion
2. Add image upload/support
3. Add code blocks with syntax highlighting
4. Add tables
5. Add task lists (checkboxes)

**Phase 4: Polish (2 days)**
1. Add bubble menu on selection
2. Add slash commands
3. Implement auto-save
4. Add word count
5. Dark mode support

**Phase 5: Migration (1 day)**
1. Handle existing plain text notes
2. Test data migration
3. Update convex schema if needed

### 11. Technical Considerations

**Performance:**
- Lazy load editor component
- Debounce auto-save (500ms)
- Limit image size (max 5MB)
- Use virtual rendering for long notes

**Security:**
- Sanitize HTML output (DOMPurify)
- Validate image uploads
- Prevent XSS in links
- Rate limit saves

**Accessibility:**
- Keyboard navigation support
- ARIA labels on toolbar
- High contrast mode support
- Screen reader compatibility

### 12. Success Metrics
- Users create notes 2x more frequently
- Average note length increases by 50%
- User satisfaction score > 4.5/5
- Zero data loss incidents
- <100ms editor load time

## Next Steps
1. Approve plan and select implementation option
2. Set up TipTap in development environment
3. Create proof-of-concept with basic formatting
4. Iterate based on feedback
5. Full implementation and testing
