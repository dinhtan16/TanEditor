import './styles/_variables.scss';
import './styles/index.css';

export { default, default as TanEditor } from './components/tiptap/TipTapEditor';
export type { TanEditorProps } from './components/tiptap/TipTapEditor';
export type { PageSettings } from './components/tiptap/TipTapEditor/types';
export { DEFAULT_PAGE_SETTINGS } from './components/tiptap/TipTapEditor/constants';

// Building blocks, for adding your own toolbar controls
export { ToolbarButton } from './components/ToolbarButton';
export { Divider } from './components/Devider';
export {
    DotTab,
    CellBorders,
    ParagraphLineHeight,
    RuleStyle,
    TableTemplateAttributes,
} from './components/tiptap/tiptap-extension/template-extensions';
export { Pagination, createPageLayout } from './pagination';
