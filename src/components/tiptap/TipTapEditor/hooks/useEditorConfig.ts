import { useEditor } from '@tiptap/react';
import type { AnyExtension } from '@tiptap/core';
import { useMemo } from 'react';
import StarterKit from '@tiptap/starter-kit';
import { TableKit } from '@tiptap/extension-table';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import {
    Color,
    FontFamily,
    FontSize,
    LineHeight,
    TextStyle,
} from '@tiptap/extension-text-style';
import { FileHandler } from '@tiptap/extension-file-handler';
import {
    handleImageUpload,
    insertImageFiles,
    MAX_FILE_SIZE,
} from '../../../../lib/tiptap-utils';
import { ImageUploadNode } from '../../tiptap-node/image-upload-node';
import { Pagination } from '../../../../pagination';
import { ImageWrapExtension } from '../../tiptap-extension/image-wrap-extension';
import { BorderedTable } from '../../tiptap-extension/table-border-extension';
import {
    StyledTableCell,
    StyledTableHeader,
} from '../../tiptap-extension/table-cell-style-extension';
import {
    CellBorders,
    DotTab,
    ParagraphLineHeight,
    RuleStyle,
    TableTemplateAttributes,
} from '../../tiptap-extension/template-extensions';

export interface EditorConfigOptions {
    /** Initial HTML; later changes are synced by the caller. */
    content: string;
    onUpdate: (html: string) => void;
    /** Extra class names on the editable content (e.g. a print stylesheet's root class). */
    contentClassName?: string;
    /** Extra TipTap extensions, added after the built-in ones. Read once, on mount. */
    extensions?: AnyExtension[];
}

export function useEditorConfig({
    content,
    onUpdate,
    contentClassName,
    extensions: extraExtensions = [],
}: EditorConfigOptions) {
    const extensions = useMemo(
        () => [
            TextStyle,
            StarterKit.configure({
                link: { openOnClick: false },
            }),
            // Images are inline so the paragraph alignment buttons align a logo like any
            // other field. Pasted/uploaded images are stored as data URLs; drag the corners
            // to resize, wrap text around them.
            ImageWrapExtension.configure({
                inline: true,
                allowBase64: true,
                resize: {
                    enabled: true,
                    alwaysPreserveAspectRatio: true,
                    minWidth: 16,
                    minHeight: 16,
                },
            }),
            FileHandler.configure({
                allowedMimeTypes: [
                    'image/png',
                    'image/jpeg',
                    'image/gif',
                    'image/webp',
                ],
                onPaste: (editor, files, htmlContent) => {
                    // Copied web content with its own <img> tags is handled by the default HTML paste
                    if (htmlContent && /<img\b/i.test(htmlContent)) return;
                    insertImageFiles(
                        editor,
                        files,
                        editor.state.selection.anchor
                    );
                },
                onDrop: (editor, files, pos) => {
                    insertImageFiles(editor, files, pos);
                },
            }),
            Color.configure({ types: ['textStyle'] }),
            // The table itself comes from BorderedTable (hide-borders setting + toggle button)
            BorderedTable.configure({
                resizable: true,
                HTMLAttributes: { class: 'tiptap-table' },
            }),
            // Cells with background color and vertical alignment
            StyledTableCell.configure({
                HTMLAttributes: { class: 'tiptap-table-cell' },
            }),
            StyledTableHeader.configure({
                HTMLAttributes: { class: 'tiptap-table-header' },
            }),
            TableKit.configure({
                table: false,
                tableCell: false,
                tableHeader: false,
                tableRow: { HTMLAttributes: { class: 'tiptap-table-row' } },
            }),
            TableTemplateAttributes,
            CellBorders,
            RuleStyle,
            DotTab,
            ParagraphLineHeight,
            FontFamily.configure({ types: ['textStyle'] }),
            FontSize.configure({ types: ['textStyle'] }),
            LineHeight.configure({ types: ['textStyle'] }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
            }),
            Highlight.configure({ multicolor: true }),
            Pagination,
            ImageUploadNode.configure({
                accept: 'image/*',
                maxSize: MAX_FILE_SIZE,
                limit: 3,
                upload: handleImageUpload,
            }),
            ...extraExtensions,
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps -- the editor is created once
        []
    );

    return useEditor({
        extensions,
        immediatelyRender: false,
        content: content || '<p></p>',
        editorProps: {
            attributes: {
                class: [
                    'tiptap-editor-content focus:outline-none',
                    contentClassName,
                ]
                    .filter(Boolean)
                    .join(' '),
            },
        },
        onUpdate: ({ editor }) => onUpdate(editor.getHTML()),
    });
}
