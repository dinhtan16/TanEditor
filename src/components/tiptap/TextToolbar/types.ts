import type { Editor } from '@tiptap/react';
import type { ReactNode } from 'react';

export interface TextToolbarProps {
    editor: Editor;
    /** Extra controls appended to the toolbar */
    children?: ReactNode;
}

export interface ToolbarSectionProps {
    editor: Editor;
}

export interface EditorToolbarState {
    isBold: boolean;
    canBold: boolean;
    isUnderline: boolean;
    canUnderline: boolean;
    isItalic: boolean;
    canItalic: boolean;
    isStrike: boolean;
    canStrike: boolean;
    isCode: boolean;
    canCode: boolean;
    isBlockquote: boolean;
    isInTable: boolean;
    isLink: boolean;
    canUndo: boolean;
    canRedo: boolean;
}
