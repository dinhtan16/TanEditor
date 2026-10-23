import { Image } from '@tiptap/extension-image';
import type { NodeView } from '@tiptap/pm/view';
import type { Node as PMNode } from '@tiptap/pm/model';
import { syncImageElement } from './template-extensions';

/**
 * Image with text wrapping, like "Wrap text" in Google Docs / Word.
 *
 * - none:  the image sits on its own line
 * - left:  the image floats left, text flows on its right
 * - right: the image floats right, text flows on its left
 */
export type ImageWrap = 'none' | 'left' | 'right';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        imageWrap: {
            setImageWrap: (wrap: ImageWrap) => ReturnType;
        };
    }
}

const WRAP_MARGIN: Record<ImageWrap, string> = {
    none: '',
    left: '4px 16px 8px 0',
    right: '4px 0 8px 16px',
};

function wrapStyle(wrap: ImageWrap): string {
    return wrap === 'none'
        ? ''
        : `float: ${wrap}; margin: ${WRAP_MARGIN[wrap]};`;
}

function applyWrap(element: HTMLElement, wrap: ImageWrap) {
    element.style.float = wrap === 'none' ? '' : wrap;
    element.style.margin = WRAP_MARGIN[wrap];
    element.dataset.wrap = wrap;

    // renderHTML also puts the float on the <img>; inside the container it would double the margin
    const img = element.querySelector('img');

    img?.style.removeProperty('float');
    img?.style.removeProperty('margin');
}

export const ImageWrapExtension = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            // Width is saved as an inline style (as the print templates always did) and
            // height is never saved: a {{clinic.logo}} token is replaced by each
            // branch's own logo at print time, whose aspect ratio is unknown here.
            width: {
                default: null,
                parseHTML: el => {
                    const value = parseFloat(
                        el.style.width || el.getAttribute('width') || ''
                    );

                    return Number.isFinite(value) && value > 0
                        ? Math.round(value)
                        : null;
                },
                renderHTML: attrs =>
                    attrs.width
                        ? { style: `width:${Math.round(attrs.width)}px` }
                        : {},
            },
            height: {
                default: null,
                parseHTML: () => null,
                renderHTML: () => ({}),
            },
            // Lucide icons inserted from the SVG picker (recolourable)
            ...Object.fromEntries(
                [
                    ['footerIcon', 'data-footer-icon'],
                    ['iconColor', 'data-icon-color'],
                    ['iconBackgroundColor', 'data-icon-background-color'],
                ].map(([attribute, dataAttribute]) => [
                    attribute,
                    {
                        default: null,
                        parseHTML: (el: HTMLElement) =>
                            el.getAttribute(dataAttribute),
                        renderHTML: (attrs: Record<string, unknown>) =>
                            attrs[attribute]
                                ? { [dataAttribute]: attrs[attribute] }
                                : {},
                    },
                ])
            ),
            wrap: {
                default: 'none',
                parseHTML: element => {
                    const wrap =
                        element.getAttribute('data-wrap') ??
                        element.style.float;

                    return wrap === 'left' || wrap === 'right' ? wrap : 'none';
                },
                renderHTML: attributes => {
                    const wrap = attributes.wrap as ImageWrap;

                    return wrap === 'none'
                        ? {}
                        : { 'data-wrap': wrap, style: wrapStyle(wrap) };
                },
            },
        };
    },

    addCommands() {
        return {
            ...this.parent?.(),
            setImageWrap:
                (wrap: ImageWrap) =>
                ({ commands }) =>
                    commands.updateAttributes(this.name, { wrap }),
        };
    },

    // The resizable node view wraps the <img> in a container: float the container,
    // and re-apply the wrap when the attribute changes (the base view ignores updates)
    addNodeView() {
        const createView = this.parent?.();

        if (!createView) return null;

        return props => {
            const view = createView(props) as NodeView & { dom: HTMLElement };
            const baseUpdate = view.update?.bind(view);

            applyWrap(view.dom, props.node.attrs.wrap);
            syncImageElement(view, props.node);
            view.update = (node: PMNode, decorations, innerDecorations) => {
                const handled = baseUpdate
                    ? baseUpdate(node, decorations, innerDecorations)
                    : node.type === props.node.type;

                if (handled) {
                    applyWrap(view.dom, node.attrs.wrap);
                    syncImageElement(view, node);
                }
                return handled;
            };

            return view;
        };
    },
});
