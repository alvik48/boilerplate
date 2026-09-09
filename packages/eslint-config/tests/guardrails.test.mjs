// Guardrail fixture suite.
//
// Plant-a-violation-then-revert proves a rule once, at authoring time, and
// proves nothing thereafter. These fixtures are committed and asserted in BOTH
// directions on every run: every `invalid/` file must report its expected rule,
// and every `valid/` file must be clean.
//
// `valid/` matters more than `invalid/`. False positives are the failure mode
// that gets rules disabled, and a rule that fires on legitimate code trains
// agents to add disable comments — worse than no rule at all.
//
// Driven by ESLint's Linter API rather than the CLI, and with type-aware rules
// left out, so the fixtures need no tsconfig or generated artifacts.

import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { Linter } from 'eslint';
import tseslint from 'typescript-eslint';

import {
  RESTRICTED_IMPORTS_BACKEND,
  RESTRICTED_IMPORTS_DATA,
  RESTRICTED_IMPORTS_DOMAIN,
} from '../rules/boundaries.mjs';
import { thinController } from '../rules/thin-controller.mjs';

const fixturesDir = fileURLToPath(new URL('../fixtures', import.meta.url));

const linter = new Linter();

const architecturePlugin = { rules: { 'thin-controller': thinController } };

// Mirrors the layering in backend.mjs: backend-wide restrictions, then domain,
// then a data-layer re-allow. Last matching entry wins, as in flat config.
const configFor = (relativePath) => {
  const segments = relativePath.split('/').slice(0, -1);
  const inDomain = segments.includes('domain');
  const inData = segments.includes('data');

  const restricted = inDomain
    ? RESTRICTED_IMPORTS_DOMAIN
    : inData
      ? RESTRICTED_IMPORTS_DATA
      : RESTRICTED_IMPORTS_BACKEND;

  return {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: { architecture: architecturePlugin },
    rules: {
      'no-restricted-imports': ['error', restricted],
      'architecture/thin-controller': 'error',
    },
  };
};

const listFixtures = (kind) => {
  const root = join(fixturesDir, kind);
  const found = [];

  const walk = (dir, prefix) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        walk(join(dir, entry.name), relative);
      } else if (entry.name.endsWith('.ts')) {
        found.push(relative);
      }
    }
  };

  walk(root, '');

  return found.sort();
};

const lintFixture = (kind, relativePath) => {
  const absolute = join(fixturesDir, kind, relativePath);
  const code = readFileSync(absolute, 'utf8');

  return linter.verify(code, configFor(relativePath), absolute);
};

// The rule each invalid fixture must report. Asserting the specific rule id
// stops a fixture from "passing" because some unrelated rule happened to fire.
const EXPECTED = {
  'controller-alias.ts': 'architecture/thin-controller',
  'controller-branching.ts': 'architecture/thin-controller',
  'controller-callback.ts': 'architecture/thin-controller',
  'controller-loop.ts': 'architecture/thin-controller',
  'controller-promise-all.ts': 'architecture/thin-controller',
  'controller-sequential.ts': 'architecture/thin-controller',
  'deep-package-import.ts': 'no-restricted-imports',
  'domain/data-layer-import.ts': 'no-restricted-imports',
  'domain/framework-import.ts': 'no-restricted-imports',
  'domain/prisma-import.ts': 'no-restricted-imports',
  'prisma-in-service.ts': 'no-restricted-imports',
  'relative-escape-four.ts': 'no-restricted-imports',
  'relative-escape-three.ts': 'no-restricted-imports',
  'relative-escape-two.ts': 'no-restricted-imports',
};

// Which thin-controller message each controller fixture must produce. The
// branching case has its own message on purpose: saying "you called two things"
// there would be wrong, because only one branch runs.
const EXPECTED_MESSAGE_ID = {
  'controller-alias.ts': 'collaboratorAlias',
  'controller-branching.ts': 'branchingCollaborators',
  'controller-callback.ts': 'collaboratorInLoop',
  'controller-loop.ts': 'collaboratorInLoop',
  'controller-promise-all.ts': 'multipleCollaborators',
  'controller-sequential.ts': 'multipleCollaborators',
};

describe('invalid fixtures report their rule', () => {
  const fixtures = listFixtures('invalid');

  it('has an expectation for every invalid fixture', () => {
    assert.deepEqual(fixtures, Object.keys(EXPECTED).sort(), 'every invalid fixture needs an entry in EXPECTED');
  });

  for (const fixture of fixtures) {
    it(fixture, () => {
      const messages = lintFixture('invalid', fixture);
      const ruleIds = messages.map((message) => message.ruleId);

      assert.ok(
        ruleIds.includes(EXPECTED[fixture]),
        `expected ${EXPECTED[fixture]}, got ${JSON.stringify(messages.map((m) => ({ ruleId: m.ruleId, message: m.message })))}`,
      );

      const expectedMessageId = EXPECTED_MESSAGE_ID[fixture];

      if (expectedMessageId) {
        const ids = messages.map((message) => message.messageId);

        assert.ok(
          ids.includes(expectedMessageId),
          `expected messageId ${expectedMessageId}, got ${JSON.stringify(ids)}`,
        );
      }
    });
  }
});

describe('valid fixtures are clean', () => {
  for (const fixture of listFixtures('valid')) {
    it(fixture, () => {
      const messages = lintFixture('valid', fixture);

      assert.deepEqual(
        messages.map((message) => ({ ruleId: message.ruleId, message: message.message })),
        [],
      );
    });
  }
});
