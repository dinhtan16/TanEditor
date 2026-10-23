import { Extension, mergeAttributes, Node, type Editor } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import type { NodeView } from '@tiptap/pm/view';
import type { Node as PMNode } from '@tiptap/pm/model';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        dotTab: {
            insertDotTab: () => ReturnType;
        };
    }
}

/**
 * Dotted tab, like a Word tab stop with a "....." leader: a
 * <span data-tab-leader> that stretches to fill the rest of the line (several
 * on one line share the free space). Text typed into it sits on the dots, as
 * on a fill-in form. The stretching is done by the print CSS
 * (PAYMENT_TEMPLATE_PRINT_CSS), so the editor and the printout match.
 *
 * Tab inserts one, except in a bordered table (Tab moves to the next cell, as
 * in Word) and at the start of a list item (Tab indents the item). Inside a
 * leader, Tab / Shift+Tab move between leaders and Enter starts a plain line.
 */
// A leader always holds at least this non-breaking space: the browser can't
// put the caret into an inline element that has no characters.
const LEADER_FILL = ' ';
const isBlankLeader = (node: PMNode) =>
    node.textContent.replaceAll(LEADER_FILL, '') === '';

export const DotTab = Node.create({
    name: 'dotTab',
    group: 'inline',
    inline: true,
    content: 'text*',
    // Above the table and list keymaps, so Tab reaches this handler first
    priority: 1000,

    parseHTML() {
        return [{ tag: 'span[data-tab-leader]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'span',
            mergeAttributes(HTMLAttributes, { 'data-tab-leader': 'dots' }),
            0,
        ];
    },

    addCommands() {
        return {
            insertDotTab:
                () =>
                ({ tr, dispatch, state }) => {
                    if (dispatch) {
                        tr.deleteSelection();
                        const pos = tr.selection.from;
                        tr.insert(
                            pos,
                            this.type.create(
                                null,
                                state.schema.text(LEADER_FILL)
                            )
                        );
                        // Cursor inside, ready to type on the dots
                        tr.setSelection(TextSelection.create(tr.doc, pos + 2));
                        tr.scrollIntoView();
                    }
                    return true;
                },
        };
    },

    addKeyboardShortcuts() {
        const isLeader = (node?: PMNode | null) =>
            node?.type.name === this.name;
        const moveTo = (editor: Editor, pos: number) =>
            editor.view.dispatch(
                editor.state.tr.setSelection(
                    TextSelection.create(editor.state.doc, pos)
                )
            );
        // End of the text in the nearest leader after / before `pos`
        const findLeader = (
            editor: Editor,
            pos: number,
            direction: 'next' | 'previous'
        ) => {
            let found: number | null = null;
            editor.state.doc.descendants((node, nodePos) => {
                if (!isLeader(node)) return;
                const inside = nodePos + node.nodeSize - 1;
                if (direction === 'next' && nodePos >= pos && found === null)
                    found = inside;
                if (direction === 'previous' && nodePos + node.nodeSize <= pos)
                    found = inside;
                return false;
            });
            return found;
        };

        return {
            // The browser can't edit around a flex-stretched span reliably, so
            // the keys next to / inside a leader are handled here.
            Backspace: ({ editor }) => {
                const { $from, empty } = editor.state.selection;
                if (!empty) return false;
                // In a leader with nothing typed (only LEADER_FILL, which is
                // put back whenever it is deleted), Backspace removes the
                // leader; at the start of a filled one it steps out.
                if (
                    isLeader($from.parent) &&
                    (isBlankLeader($from.parent) || $from.parentOffset === 0)
                ) {
                    const start = $from.before();
                    if (isBlankLeader($from.parent))
                        editor.view.dispatch(
                            editor.state.tr.delete(
                                start,
                                start + $from.parent.nodeSize
                            )
                        );
                    else moveTo(editor, start);
                    return true;
                }
                const before = $from.nodeBefore;
                if (!isLeader(before) || !before) return false;
                const start = $from.pos - before.nodeSize;
                if (isBlankLeader(before))
                    editor.view.dispatch(
                        editor.state.tr.delete(start, $from.pos)
                    );
                // Step into the leader and delete its last character
                else
                    editor.view.dispatch(
                        editor.state.tr
                            .setSelection(
                                TextSelection.create(
                                    editor.state.doc,
                                    $from.pos - 1
                                )
                            )
                            .delete($from.pos - 2, $from.pos - 1)
                    );
                return true;
            },
            Delete: ({ editor }) => {
                const { $from, empty } = editor.state.selection;
                const after = $from.nodeAfter;
                if (!empty || !after || !isLeader(after)) return false;
                if (isBlankLeader(after))
                    editor.view.dispatch(
                        editor.state.tr.delete(
                            $from.pos,
                            $from.pos + after.nodeSize
                        )
                    );
                else moveTo(editor, $from.pos + 1);
                return true;
            },
            // Inside a leader, Tab goes to the next leader (on this line or
            // below), like moving between the blanks of a form; past the last
            // one it adds a new dotted line under the current one.
            Tab: ({ editor }) => {
                const { $from, empty } = editor.state.selection;
                if (isLeader($from.parent)) {
                    const next = findLeader(editor, $from.after(), 'next');
                    if (next !== null) {
                        moveTo(editor, next);
                        return true;
                    }
                    const block = $from.node(-1);
                    const at = $from.after(-1);
                    const tr = editor.state.tr.insert(
                        at,
                        block.type.create(
                            block.attrs,
                            this.type.create(
                                null,
                                editor.state.schema.text(LEADER_FILL)
                            )
                        )
                    );
                    tr.setSelection(TextSelection.create(tr.doc, at + 3));
                    editor.view.dispatch(tr.scrollIntoView());
                    return true;
                }
                if (
                    editor.isActive('table') &&
                    !editor.getAttributes('table').hideBorders
                )
                    return false;
                if (
                    editor.isActive('listItem') &&
                    empty &&
                    $from.parentOffset === 0
                )
                    return false;
                return editor.commands.insertDotTab();
            },
            'Shift-Tab': ({ editor }) => {
                const { $from } = editor.state.selection;
                if (!isLeader($from.parent)) return false;
                const previous = findLeader(editor, $from.before(), 'previous');
                if (previous !== null) moveTo(editor, previous);
                return true;
            },
            // Inside a leader, Enter leaves the dotted lines: a plain empty
            // paragraph under the current line (instead of splitting the
            // leader onto a new dotted line).
            Enter: ({ editor }) => {
                const { $from } = editor.state.selection;
                if (!isLeader($from.parent)) return false;
                const at = $from.after(-1);
                const tr = editor.state.tr.insert(
                    at,
                    editor.state.schema.nodes.paragraph.create()
                );
                tr.setSelection(TextSelection.create(tr.doc, at + 1));
                editor.view.dispatch(tr.scrollIntoView());
                return true;
            },
            // At the end of a leader, → leaves it to type on the same line. A
            // caret right at the leader's edge is put back inside it by the
            // browser, so land after a space (adding one when there is none).
            // It is a non-breaking space: Chrome sends typing after a plain
            // trailing space to the next paragraph.
            ArrowRight: ({ editor }) => {
                const { $from, empty } = editor.state.selection;
                if (
                    !empty ||
                    !isLeader($from.parent) ||
                    $from.parentOffset < $from.parent.content.size
                )
                    return false;
                const after = $from.after();
                const next = editor.state.doc.resolve(after).nodeAfter;
                if (next?.isText && /^[  ]/.test(next.text ?? ''))
                    moveTo(editor, after + 1);
                else {
                    const tr = editor.state.tr.insertText(' ', after);
                    tr.setSelection(TextSelection.create(tr.doc, after + 1));
                    editor.view.dispatch(tr);
                }
                return true;
            },
        };
    },

    // Keeps every leader well-formed after an edit:
    // - marks belong on the text inside a leader, not on the leader itself (a
    //   marked leader is wrapped in <strong>… and stops stretching);
    // - an emptied leader gets LEADER_FILL back, so the caret can stay in it.
    addProseMirrorPlugins() {
        const type = this.type;
        return [
            new Plugin({
                key: new PluginKey('dotTabNormalize'),
                appendTransaction: (transactions, _old, state) => {
                    if (!transactions.some(tr => tr.docChanged)) return null;
                    const tr = state.tr;
                    const emptied: number[] = [];
                    state.doc.descendants((node, pos) => {
                        if (node.type !== type) return;
                        node.marks.forEach(mark =>
                            tr.removeNodeMark(pos, mark)
                        );
                        if (node.content.size === 0) emptied.push(pos + 1);
                        return false;
                    });
                    // Last first, so the earlier positions stay valid
                    emptied
                        .reverse()
                        .forEach(pos => tr.insertText(LEADER_FILL, pos));
                    return tr.docChanged ? tr : null;
                },
            }),
        ];
    },
});

/**
 * Attributes the print templates already store (written by the previous
 * template editor and by the default templates in payment-print-template.ts).
 * They must keep round-tripping, otherwise opening and saving an existing
 * template would silently drop them from the printed output.
 */

// Paragraph/heading line-height as an inline style. Named so it does not clash
// with the text-style LineHeight extension used by the line spacing picker.
export const ParagraphLineHeight = Extension.create({
    name: 'paragraphLineHeight',
    addGlobalAttributes() {
        return [
            {
                types: ['paragraph', 'heading'],
                attributes: {
                    lineHeight: {
                        default: null,
                        parseHTML: (el: HTMLElement) =>
                            el.style.lineHeight || null,
                        renderHTML: (attrs: Record<string, unknown>) =>
                            attrs.lineHeight
                                ? { style: `line-height:${attrs.lineHeight}` }
                                : {},
                    },
                },
            },
        ];
    },
});

export const RuleStyle = Extension.create({
    name: 'ruleStyle',
    addGlobalAttributes() {
        return [
            {
                types: ['horizontalRule'],
                attributes: {
                    thickness: {
                        default: 2,
                        parseHTML: (element: HTMLElement) => {
                            const value = Number.parseFloat(
                                element.style.height ||
                                    element.style.borderTopWidth
                            );

                            return Number.isFinite(value)
                                ? Math.min(40, Math.max(1, value))
                                : 2;
                        },
                        renderHTML: (attrs: Record<string, unknown>) => ({
                            style: `width:100%;height:${attrs.thickness}px;border:0;margin:12px 0;print-color-adjust:exact;-webkit-print-color-adjust:exact`,
                        }),
                    },
                    ruleColor: {
                        default: '#000000',
                        parseHTML: (element: HTMLElement) =>
                            element.getAttribute('data-rule-color') ||
                            element.style.backgroundColor ||
                            element.style.borderTopColor ||
                            '#000000',
                        renderHTML: (attrs: Record<string, unknown>) => ({
                            style: `background-color:${attrs.ruleColor}`,
                            'data-rule-color': attrs.ruleColor,
                        }),
                    },
                },
            },
        ];
    },
});

// Per-edge cell borders set by the "Viền ô" menu
export const CellBorders = Extension.create({
    name: 'cellBorders',
    addGlobalAttributes() {
        return [
            {
                types: ['tableCell', 'tableHeader'],
                attributes: Object.fromEntries(
                    [
                        ['customBorders', 'data-custom-borders'],
                        ...['top', 'bottom', 'left', 'right'].map(edge => [
                            `${edge}Border`,
                            `data-${edge}-border`,
                        ]),
                    ].map(([attribute, marker]) => [
                        attribute,
                        {
                            default: false,
                            parseHTML: (element: HTMLElement) =>
                                element.getAttribute(marker) === 'true',
                            renderHTML: (attributes: Record<string, unknown>) =>
                                attributes[attribute]
                                    ? { [marker]: 'true' }
                                    : {},
                        },
                    ])
                ),
            },
        ];
    },
});

// `compact` (table shrinks to its content and floats right) and
// `customBorders` (only the edges picked in the "Viền ô" menu print).
export const TableTemplateAttributes = Extension.create({
    name: 'tableTemplateAttributes',
    addGlobalAttributes() {
        return [
            {
                types: ['table'],
                attributes: {
                    compact: {
                        default: false,
                        parseHTML: (el: HTMLElement) =>
                            el.getAttribute('data-compact') === 'true',
                        renderHTML: (attrs: Record<string, unknown>) =>
                            attrs.compact ? { 'data-compact': 'true' } : {},
                    },
                    customBorders: {
                        default: false,
                        parseHTML: (el: HTMLElement) =>
                            el.getAttribute('data-custom-borders') === 'true',
                        renderHTML: (attrs: Record<string, unknown>) =>
                            attrs.customBorders
                                ? { 'data-custom-borders': 'true' }
                                : {},
                    },
                },
            },
        ];
    },
});

export const isTemplateToken = (src: unknown): boolean =>
    typeof src === 'string' && src.startsWith('{{');

/**
 * A logo is inserted with src="{{clinic.logo}}", a merge token resolved per
 * branch at print time, so it can never load in the editor. Show a dashed
 * square with the token instead of the browser's broken-image box; the node
 * (and the saved HTML) keeps the token.
 */
export function tokenPlaceholderSrc(token: string): string {
    const text = token.replace(/[<>&"]/g, '');
    const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">' +
        '<rect x="1" y="1" width="118" height="118" rx="4" fill="#F8FAFC" stroke="#B7C0CE" stroke-dasharray="4 3"/>' +
        `<text x="60" y="64" font-family="sans-serif" font-size="11" fill="#6B7A90" text-anchor="middle">${text}</text>` +
        '</svg>';

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Shows the placeholder for token images inside a node view's <img>. */
export function syncImageElement(
    view: NodeView & { dom: HTMLElement },
    node: PMNode
) {
    const img =
        view.dom instanceof HTMLImageElement
            ? view.dom
            : view.dom.querySelector('img');

    if (!img) return;
    // The base resizable view ignores attribute updates, so a recoloured icon
    // (new src) or a width set from the toolbar would otherwise not show.
    const src = isTemplateToken(node.attrs.src)
        ? tokenPlaceholderSrc(node.attrs.src)
        : node.attrs.src;

    if (src && img.getAttribute('src') !== src) img.src = src;
    if (node.attrs.width) img.style.width = `${node.attrs.width}px`;
}
