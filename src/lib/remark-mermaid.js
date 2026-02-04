import { visit } from 'unist-util-visit';

export const mermaid = () => {
	return (tree) => {
		visit(tree, 'code', (node, index, parent) => {
			if (node.lang === 'mermaid') {
				// Escape curly braces so Svelte doesn't try to execute the content as JS.
				// The browser will decode these back to { } before Mermaid reads them.
				const escapedValue = node.value.replace(/{/g, '&#123;').replace(/}/g, '&#125;');

				const html = `<pre class="mermaid">${escapedValue}</pre>`;

				// Replace the current node with the new html node
				parent.children.splice(index, 1, {
					type: 'html',
					value: html
				});
			}
		});
	};
};
