import GithubSlugger from 'github-slugger';
import type { Root } from 'mdast';
import { toString } from 'mdast-util-to-string';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import type { Document } from './model.js';

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkStringify, { bullet: '-', fences: true });

export const inspectMarkdown = (markdown: string): { tree: Root; headings: Document['headings'] } => {
  const tree = processor.parse(markdown);
  const headings: Document['headings'] = [];
  const slugger = new GithubSlugger();

  visit(tree, 'heading', (node) => {
    const title = toString(node);

    headings.push({ id: slugger.slug(title), title, depth: node.depth });
  });

  if (headings.filter((heading) => heading.depth === 1).length !== 1) {
    throw new Error('Document must contain exactly one H1');
  }

  return { tree, headings };
};

export const normalizeMarkdown = (markdown: string, resolve: (url: string) => string) => {
  const { tree } = inspectMarkdown(markdown);

  visit(tree, (node) => {
    if (node.type === 'link' || node.type === 'image' || node.type === 'definition') {
      node.url = resolve(node.url);
    }

    if (node.type === 'html') {
      throw new Error('Use ordinary Markdown instead of raw HTML in public docs');
    }
  });

  return processor.stringify(tree);
};

/** AST positions distinguish actual headings from comments inside code fences. */
export const markdownSections = (markdown: string) => {
  const { tree } = inspectMarkdown(markdown);
  const starts: number[] = [];

  visit(tree, 'heading', (node) => {
    starts.push(node.position!.start.offset!);
  });

  return starts.map((start, index) => markdown.slice(index === 0 ? 0 : start, starts[index + 1]));
};
