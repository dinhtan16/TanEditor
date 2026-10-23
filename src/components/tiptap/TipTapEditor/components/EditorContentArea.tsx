import { TableCellToolbar } from '../../tableTiptap/TableCellToolbar';
import { EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import TextBubbleToolbar from './TextBubbleToolbar';
import ImageBubbleToolbar from './ImageBubbleToolbar';
import { memo, useCallback, useEffect } from 'react';
import type { PageSettings } from '../types';
import { PAGE_GAP_PX } from '../constants';
import { usePageCount, usePageLayout } from '../hooks/usePageLayout';

export interface EditorContentAreaProps {
    editor: Editor;
    pageSettings: PageSettings;
    /** Watermark markup drawn over the page (not part of the edited content) */
    watermarkHtml?: string;
}

export const EditorContentArea = memo(function EditorContentArea({
    editor,
    pageSettings,
    watermarkHtml,
}: EditorContentAreaProps) {
    const handleContainerClick = useCallback(() => {
        if (!editor?.isFocused) {
            editor?.commands.focus('end');
        }
    }, [editor]);

    const layout = usePageLayout(pageSettings);
    const pageCount = usePageCount(editor);

    useEffect(() => {
        editor?.commands.setPageLayout({
            contentHeight: layout.contentHeight,
            marginTop: layout.marginTop,
            marginBottom: layout.marginBottom,
            gap: PAGE_GAP_PX,
        });
    }, [editor, layout]);

    if (!editor) return null;

    return (
        <div
            className="editor-scroll-container flex min-h-0 flex-1 overflow-auto p-8"
            style={{ justifyContent: 'safe center' }}
        >
            <div
                onClick={handleContainerClick}
                className="relative h-fit w-fit flex-none"
            >
                <TextBubbleToolbar editor={editor} />
                <ImageBubbleToolbar editor={editor} />
                <div
                    className="document-page relative bg-white"
                    style={{
                        width:
                            pageSettings.orientation === 'portrait'
                                ? '210mm'
                                : '297mm',
                        minHeight: `${
                            pageCount * layout.pitch - PAGE_GAP_PX
                        }px`,
                        paddingTop: `${pageSettings.topMargin}mm`,
                        paddingBottom: `${pageSettings.bottomMargin}mm`,
                        paddingLeft: `${pageSettings.leftMargin}mm`,
                        paddingRight: `${pageSettings.rightMargin}mm`,
                    }}
                >
                    <div className="relative">
                        <EditorContent editor={editor} />
                        {watermarkHtml && (
                            <div
                                className="nfc-tpl pointer-events-none absolute inset-0 z-[1]"
                                aria-hidden="true"
                                dangerouslySetInnerHTML={{
                                    __html: watermarkHtml,
                                }}
                            />
                        )}
                    </div>
                </div>
                <TableCellToolbar editor={editor} />
            </div>
        </div>
    );
});
