# Vendored Skill Licenses

The project keeps upstream skills in `.agents/skills` with their original
supporting files. Licenses from source repository roots are retained here because
the skills installer does not include those files in the installed directories.
Keeping these copies outside the skill directories preserves their recorded
`computedHash` values.

| Project skills                                                      | Upstream source                                                                                                        | Preserved license or declaration                                                                                                                       |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `frontend-design`                                                   | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design)                             | [Bundled LICENSE.txt](../../../.agents/skills/frontend-design/LICENSE.txt)                                                                             |
| `nestjs-best-practices`                                             | [kadajett/agent-nestjs-skills](https://github.com/kadajett/agent-nestjs-skills/tree/main/skills/nestjs-best-practices) | MIT declaration and author metadata in [SKILL.md](../../../.agents/skills/nestjs-best-practices/SKILL.md); upstream provides no separate license file. |
| `node`, `skill-optimizer`, `typescript-magician`                    | [mcollina/skills](https://github.com/mcollina/skills/blob/main/LICENSE)                                                | [MIT license](mcollina-skills.txt)                                                                                                                     |
| All seven `prisma-*` skills                                         | [prisma/skills](https://github.com/prisma/skills/blob/main/LICENSE)                                                    | [MIT license](prisma-skills.txt)                                                                                                                       |
| `next-cache-components-adoption`, `next-cache-components-optimizer` | [vercel/next.js](https://github.com/vercel/next.js/blob/canary/license.md)                                             | [MIT license](nextjs.txt)                                                                                                                              |
| `shadcn`                                                            | [shadcn-ui/ui](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md), recorded as `shadcn/ui` in the lockfile          | [MIT license](shadcn.txt)                                                                                                                              |
| `turborepo`                                                         | [vercel/turborepo](https://github.com/vercel/turborepo/blob/main/LICENSE)                                              | [MIT license](turborepo.txt)                                                                                                                           |

The root license copies were retrieved on 2026-09-08 and are stored verbatim.
Preserve copyright notices and any bundled license files when updating skills.
Review source licenses and update this index and the retained copies in the same
maintenance change. Third-party skills retain their upstream licensing regardless
of the root package's `UNLICENSED` metadata.

See [AI-agent skills](../skills.md#maintaining-vendored-skills) for the update
workflow. Git records the reviewed skill contents; `skills-lock.json` records
their source metadata and hashes.
