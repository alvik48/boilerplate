// Unit tests for the feature's pure model logic, matching what the repository
// already uses elsewhere: `node --test` with tsx. Do not introduce Vitest.
//
// The rule is tested directly -- no React, no rendering, no router.
//
// `void test(...)` matches apps/frontend.docs: node:test returns a promise the
// runner tracks itself, and the shared config treats a floating promise as an
// error.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { type Article, filterByTag, isArticleTag } from '../src/features/articles/model/article';

const articles: Article[] = [
  { id: 'a_1', title: 'One', tag: 'architecture', readingMinutes: 3 },
  { id: 'a_2', title: 'Two', tag: 'testing', readingMinutes: 4 },
  { id: 'a_3', title: 'Three', tag: 'architecture', readingMinutes: 5 },
];

void test('filterByTag returns every article when no tag is selected', () => {
  assert.deepEqual(filterByTag(articles, undefined), articles);
});

void test('filterByTag returns only articles carrying the selected tag', () => {
  assert.deepEqual(
    filterByTag(articles, 'architecture').map((article) => article.id),
    ['a_1', 'a_3'],
  );
});

void test('filterByTag returns an empty list when nothing matches', () => {
  assert.deepEqual(filterByTag(articles, 'performance'), []);
});

void test('filterByTag does not mutate the input', () => {
  filterByTag(articles, 'testing');
  assert.equal(articles.length, 3);
});

void test('isArticleTag accepts a known tag and rejects anything else', () => {
  assert.equal(isArticleTag('testing'), true);
  assert.equal(isArticleTag('nonsense'), false);
  assert.equal(isArticleTag(undefined), false);
});
