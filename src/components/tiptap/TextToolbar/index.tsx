import { useEditorToolbarState } from './hooks/useEditorToolbarState';
import { FormattingButtons } from './components/button/FormattingButtons';
import { TextAlignmentButtons } from './components/button/TextAlignmentButtons';
import { HighlightButtons } from './components/button/HighlightButtons';
import { ListButtons } from './components/button/ListButtons';
import { HistoryButtons } from './components/button/HistoryButtons';
import { LinkButton } from './components/button/LinkButton';
import type { TextToolbarProps } from './types';
import { HeadingPopover } from '../header/HeadingPopover';
import { Divider } from '../../Devider';
import { FontFamilyPicker } from './components/picker/FontFamilyPicker';
import { FontSizePicker } from './components/picker/FontSizePicker';
import { LineHeightPicker } from './components/picker/LineHeightPicker';
import { TextColorPicker } from './components/picker/TextColorPicker';
import { MediaButtons } from './components/button/MediaButton';
import { Ellipsis } from 'lucide-react';
import { ToolbarButton } from '../../ToolbarButton';

export function TextToolbar({ editor, children }: TextToolbarProps) {
    const state = useEditorToolbarState(editor);

    if (!editor) return null;

    return (
        <div className="flex flex-wrap items-center gap-1">
            <HistoryButtons editor={editor} state={state} />

            <Divider />
            <HeadingPopover editor={editor} />

            <Divider />
            <FontFamilyPicker editor={editor} />
            <FontSizePicker editor={editor} />
            <LineHeightPicker editor={editor} />

            <Divider />
            <FormattingButtons editor={editor} state={state} />

            <Divider />
            <TextColorPicker editor={editor} />
            <HighlightButtons editor={editor} />

            <Divider />
            <LinkButton editor={editor} state={state} />

            <Divider />
            <TextAlignmentButtons editor={editor} />

            <Divider />
            <ListButtons editor={editor} state={state} />

            <Divider />
            <MediaButtons editor={editor} />
            <ToolbarButton
                onClick={() => editor.chain().focus().insertDotTab().run()}
                icon={Ellipsis}
                label="Dòng chấm"
                tooltip="Dòng chấm tới hết dòng (phím Tab)"
            />

            {children}
        </div>
    );
}
