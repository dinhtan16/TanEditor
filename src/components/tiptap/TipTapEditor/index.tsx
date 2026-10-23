'use client';

import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { EditorContext, type Editor } from '@tiptap/react';
import type { AnyExtension } from '@tiptap/core';
import { cn } from '../../../lib/utils';
import { useEditorConfig } from './hooks/useEditorConfig';
import { EditorContentArea } from './components/EditorContentArea';
import { TextToolbar } from '../TextToolbar';
import { DEFAULT_PAGE_SETTINGS } from './constants';
import type { PageSettings } from './types';

export interface TanEditorProps {
    /** HTML content. */
    value: string;
    onChange: (html: string) => void;
    /** Height of the editor box in px; `fill` grows with a flex parent instead. */
    height?: number | 'fill';
    className?: string;
    /** Page size and margins of the A4 sheet. Defaults to A4 portrait, 25.4mm margins. */
    pageSettings?: PageSettings;
    /** Extra class names on the editable content, e.g. the root class of a print stylesheet. */
    contentClassName?: string;
    /** CSS added next to the editor, e.g. the stylesheet the content is printed with. */
    contentCss?: string;
    /** Markup drawn over the page, not part of the edited content (e.g. a watermark). */
    watermarkHtml?: string;
    /** Extra controls appended to the toolbar. */
    toolbarExtra?: (editor: Editor) => ReactNode;
    /** Extra TipTap extensions. Read once, when the editor is created. */
    extensions?: AnyExtension[];
}

/**
 * Word-like editor: A4 pages, tables, images, dotted tabs. Based on
 * Text-editor-react (https://github.com/HuyPhan1232203/Text-editor-react, MIT).
 */
export default function TanEditor({
    value,
    onChange,
    height = 640,
    className,
    pageSettings = DEFAULT_PAGE_SETTINGS,
    contentClassName,
    contentCss,
    watermarkHtml,
    toolbarExtra,
    extensions,
}: TanEditorProps) {
    const editor = useEditorConfig({
        content: value,
        onUpdate: onChange,
        contentClassName,
        extensions,
    });

    // Sync external value changes without emitting an update or resetting the
    // cursor on every keystroke.
    useEffect(() => {
        if (!editor) return;
        const next = value || '<p></p>';

        if (next !== editor.getHTML())
            editor.commands.setContent(next, { emitUpdate: false });
    }, [editor, value]);

    return (
        <EditorContext.Provider value={{ editor }}>
            <div
                className={cn(
                    'word-editor flex flex-col overflow-hidden rounded-lg border border-[#DCE3EE] bg-[#E9EDF3]',
                    height === 'fill' && 'min-h-0 flex-1',
                    className
                )}
                style={
                    height === 'fill'
                        ? undefined
                        : ({ height } as CSSProperties)
                }
            >
                {contentCss && <style>{contentCss}</style>}
                {editor && (
                    <>
                        <div className="sticky top-0 z-10 border-b border-[#DCE3EE] bg-white p-2 shadow-sm">
                            <TextToolbar editor={editor}>
                                {toolbarExtra?.(editor)}
                            </TextToolbar>
                        </div>
                        <EditorContentArea
                            editor={editor}
                            pageSettings={pageSettings}
                            watermarkHtml={watermarkHtml}
                        />
                    </>
                )}
            </div>
        </EditorContext.Provider>
    );
}
