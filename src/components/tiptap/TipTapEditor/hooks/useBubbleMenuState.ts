import { useEditorState } from '@tiptap/react';
import type { Editor } from '@tiptap/react';

// useEditorState re-renders only when this snapshot changes. Setting state on
// every transaction looped forever: each render gives BubbleMenu a new
// shouldShow, which dispatches another transaction.
export function useBubbleMenuState(editor: Editor | null) {
    return (
        useEditorState({
            editor,
            selector: ({ editor: e }) =>
                e
                    ? {
                          isBold: e.isActive('bold'),
                          isItalic: e.isActive('italic'),
                          isUnderline: e.isActive('underline'),
                          isLink: e.isActive('link'),
                          textAlign: (e.isActive({ textAlign: 'center' })
                              ? 'center'
                              : e.isActive({ textAlign: 'right' })
                              ? 'right'
                              : 'left') as 'left' | 'center' | 'right',
                      }
                    : null,
        }) ?? {
            isBold: false,
            isItalic: false,
            isUnderline: false,
            isLink: false,
            textAlign: 'left' as const,
        }
    );
}
