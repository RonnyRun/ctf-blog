import { visit } from 'unist-util-visit';
import type { Node, Parent } from 'unist';
import type { Code } from 'mdast';

export const mermaid = () => {
    return (tree: Node) => {
        visit(tree, 'code', (node: Node, index: number | undefined, parent: Parent | undefined) => {
            const codeNode = node as Code;
            if (codeNode.lang === 'mermaid') {
                // ERROR FIX: 
                // Escape curly braces so Svelte doesn't try to execute the content as JS.
                // The browser will decode these back to { } before Mermaid reads them.
                const escapedValue = codeNode.value
                    .replace(/{/g, '&#123;')
                    .replace(/}/g, '&#125;');

                const html = `<pre class="mermaid">${escapedValue}</pre>`;

                if (parent && index !== undefined) {
                    parent.children.splice(index, 1, {
                        type: 'html',
                        value: html
                    } as any);
                }
            }
        });
    };
};