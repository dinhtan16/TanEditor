import { Quote } from 'lucide-react';
import type { ToolbarSectionProps, EditorToolbarState } from '../../types';
import { ListButton } from '../../../tiptap-ui/list-button';
import { ToolbarButton } from '../../../../ToolbarButton';
import { t } from '../../../../../i18n';

interface ListButtonsProps extends ToolbarSectionProps {
    state: EditorToolbarState;
}

export function ListButtons({ editor, state }: ListButtonsProps) {
    return (
        <>
            <ListButton
                editor={editor}
                type="bulletList"
                hideWhenUnavailable={false}
                showShortcut={false}
                tooltip={t('toolbar.bulletList')}
            />
            <ListButton
                editor={editor}
                type="orderedList"
                hideWhenUnavailable={false}
                showShortcut={false}
                tooltip={t('toolbar.orderedList')}
            />
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={state.isBlockquote}
                icon={Quote}
                label="Blockquote"
                tooltip={t('toolbar.blockquote')}
            />
        </>
    );
}
