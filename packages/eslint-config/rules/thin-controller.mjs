// @ts-check
//
// Enforces the orchestration rule from docs/repository/backend.md: a route
// handler calls at most ONE collaborator.
//
// Why a purpose-built rule rather than `max-statements` or
// `max-lines-per-function`: a handler with three sequential collaborator calls
// and a return is four statements in well under twenty lines, and passes both
// of those clean. Counting `await`s is also the wrong measure —
// `await Promise.all([this.a.x(), this.b.y()])` is one `await` and two
// operations. So this counts CALL SITES on injected collaborators.
//
// SCOPE, stated honestly: a syntactic counter measures call sites, not
// operations. `for (const i of items) { await this.orders.create(i); }` is one
// call site and N operations, which is why loops are flagged separately rather
// than counted. This rule is a DETECTOR FOR KNOWN SHAPES, not a guarantee that
// no orchestration reaches a controller. Its documented blind spot is a private
// controller method that itself calls three services; catching that needs
// cross-method analysis and is left to review.

const ROUTE_DECORATORS = new Set(['All', 'Delete', 'Get', 'Head', 'Options', 'Patch', 'Post', 'Put', 'Search', 'Sse']);

const DEFAULT_IGNORED_DEPENDENCIES = 'logger|metrics|config|tracer|clock';

const LOOP_TYPES = new Set(['DoWhileStatement', 'ForInStatement', 'ForOfStatement', 'ForStatement', 'WhileStatement']);

const FUNCTION_TYPES = new Set(['ArrowFunctionExpression', 'FunctionExpression', 'FunctionDeclaration']);

const CONDITIONAL_TYPES = new Set(['ConditionalExpression', 'IfStatement', 'SwitchCase', 'SwitchStatement']);

const getDecoratorName = (decorator) => {
  const expression = decorator.expression;

  if (expression.type === 'CallExpression' && expression.callee.type === 'Identifier') {
    return expression.callee.name;
  }

  if (expression.type === 'Identifier') {
    return expression.name;
  }

  return null;
};

const hasDecorator = (node, predicate) =>
  (node.decorators ?? []).some((decorator) => {
    const name = getDecoratorName(decorator);

    return name !== null && predicate(name);
  });

// Nest injects through constructor parameter properties
// (`constructor(private orders: OrdersService)`), which is the shape this reads.
const collectCollaborators = (classBody, ignoredPattern) => {
  const names = new Set();

  for (const member of classBody.body) {
    if (member.type !== 'MethodDefinition' || member.kind !== 'constructor') {
      continue;
    }

    for (const param of member.value.params) {
      if (param.type !== 'TSParameterProperty') {
        continue;
      }

      const inner = param.parameter;
      const identifier = inner.type === 'Identifier' ? inner : inner.type === 'AssignmentPattern' ? inner.left : null;

      if (!identifier || identifier.type !== 'Identifier') {
        continue;
      }

      // An injected logger, metrics recorder, config or tracer is cross-cutting.
      // Calling one is not orchestration, so it does not count.
      if (ignoredPattern.test(identifier.name)) {
        continue;
      }

      names.add(identifier.name);
    }
  }

  return names;
};

// `this.orders` — the object half of `this.orders.create(...)`.
const collaboratorNameOf = (node, collaborators) => {
  if (
    node.type === 'MemberExpression' &&
    node.object.type === 'ThisExpression' &&
    node.property.type === 'Identifier' &&
    collaborators.has(node.property.name)
  ) {
    return node.property.name;
  }

  return null;
};

const childNodes = function* (node) {
  for (const key of Object.keys(node)) {
    if (key === 'parent') {
      continue;
    }

    const value = node[key];

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item.type === 'string') {
          yield item;
        }
      }
    } else if (value && typeof value.type === 'string') {
      yield value;
    }
  }
};

/** @type {import('eslint').Rule.RuleModule} */
export const thinController = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Route handlers may call at most one injected collaborator; sequences belong in a use-case service.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoredDependencies: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      multipleCollaborators:
        'This route handler calls {{count}} collaborators ({{names}}). A controller owns routing and the ' +
        'request/response boundary only — move the sequence into a use-case service and call that once. ' +
        'See docs/repository/backend.md, "The Orchestration Rule".',
      branchingCollaborators:
        'This route handler chooses between collaborators ({{names}}) based on request content. Only one branch ' +
        'runs, but selecting a collaborator by request content is business branching, which a controller must not ' +
        'do. Move the decision into a use-case service. See docs/repository/backend.md, "Layer Responsibilities".',
      collaboratorInLoop:
        'This route handler calls collaborator "{{name}}" inside a loop or callback, which is N operations however ' +
        'few call sites it is. Move the iteration into a use-case service. ' +
        'See docs/repository/backend.md, "The Orchestration Rule".',
      collaboratorAlias:
        'Aliasing collaborator "{{name}}" into a local hides orchestration from review. Call it directly, or move ' +
        'the work into a use-case service. See docs/repository/backend.md, "The Orchestration Rule".',
    },
  },

  create(context) {
    const option = context.options[0] ?? {};
    const ignoredPattern = new RegExp(option.ignoredDependencies ?? DEFAULT_IGNORED_DEPENDENCIES, 'i');

    return {
      ClassBody(classBody) {
        const classNode = classBody.parent;

        if (!hasDecorator(classNode, (name) => name === 'Controller')) {
          return;
        }

        const collaborators = collectCollaborators(classBody, ignoredPattern);

        if (collaborators.size === 0) {
          return;
        }

        for (const member of classBody.body) {
          if (member.type !== 'MethodDefinition' || member.kind !== 'method') {
            continue;
          }

          // Helper methods on the class are a legitimate way to keep a handler
          // readable, so only methods carrying a route decorator are in scope.
          if (!hasDecorator(member, (name) => ROUTE_DECORATORS.has(name))) {
            continue;
          }

          inspectHandler(context, member.value.body, collaborators);
        }
      },
    };
  },
};

const inspectHandler = (context, body, collaborators) => {
  if (!body) {
    return;
  }

  const calls = [];
  const aliases = [];
  let reportedLoop = false;

  const walk = (node, deferred, conditional) => {
    if (node.type === 'VariableDeclarator' && node.init) {
      const aliased = collaboratorNameOf(node.init, collaborators);

      if (aliased !== null) {
        aliases.push({ node, name: aliased });
      }
    }

    if (node.type === 'CallExpression') {
      const name = collaboratorNameOf(
        node.callee.type === 'MemberExpression' ? node.callee.object : node.callee,
        collaborators,
      );

      if (name !== null) {
        calls.push({ node, name, deferred, conditional });
      }
    }

    const nextDeferred = deferred || LOOP_TYPES.has(node.type) || FUNCTION_TYPES.has(node.type);
    const nextConditional = conditional || CONDITIONAL_TYPES.has(node.type);

    for (const child of childNodes(node)) {
      walk(child, nextDeferred, nextConditional);
    }
  };

  walk(body, false, false);

  for (const alias of aliases) {
    context.report({ node: alias.node, messageId: 'collaboratorAlias', data: { name: alias.name } });
  }

  for (const call of calls) {
    if (call.deferred && !reportedLoop) {
      reportedLoop = true;
      context.report({ node: call.node, messageId: 'collaboratorInLoop', data: { name: call.name } });
    }
  }

  if (reportedLoop || aliases.length > 0 || calls.length < 2) {
    return;
  }

  const names = [...new Set(calls.map((call) => call.name))].sort().join(', ');
  const messageId = calls.some((call) => call.conditional) ? 'branchingCollaborators' : 'multipleCollaborators';

  context.report({
    node: calls[calls.length - 1].node,
    messageId,
    data: { count: String(calls.length), names },
  });
};

export default thinController;
