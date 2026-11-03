# Release checks list

Every release check ID, one row each. The spec is `plans/release-e2e.md` (monorepo root); words are
defined in `docs/context/release-testing.md`. Check names follow the steward's spreadsheet.

The **Test** column is one of:

-   the test file that decides the check; it must carry `releaseCheck("<id>")`;
-   `manual`: a human judgement, ticked on the sign-off issue (a test may still attach evidence);
-   `pending #NNN`: not built yet. The ticket that builds it replaces this with the file.

The sync check in `e2e/release-harness.spec.ts` (run by the CI `e2e` job) fails on a listed ID with
no annotated test, on an annotation naming an ID not listed here, and on a pending row that already
has a test. When adding or renaming a check, edit this file in the same change.

Runs: **RC** = RC run on QA; **post** = post-release run on production.

| ID                                   | Check                                                   | List rows | Runs                   | Test                                    |
| ------------------------------------ | ------------------------------------------------------- | --------- | ---------------------- | --------------------------------------- |
| `footer.links`                       | Footer links, de and en                                 | 2-3       | RC + post              | `e2e/release/footer.spec.ts`            |
| `welcome.example-queries`            | Welcome page example queries, de and en                 | 7, 9      | post                   | pending #125                            |
| `welcome.example-queries.meaning`    | Example query results say what the link text promises   | 7, 9      | -                      | manual                                  |
| `welcome.links`                      | Welcome page links, de and en                           | 8, 10     | post                   | pending #125                            |
| `prevalence.figure-download`         | Prevalence figure download                              | 11        | RC                     | pending #128                            |
| `prevalence.figure-layout`           | Prevalence figure has no overlapping text               | 11        | -                      | manual                                  |
| `prevalence.data-download`           | Prevalence data download                                | 12        | RC                     | pending #127                            |
| `prevalence.data-filter`             | Prevalence data filter                                  | 13        | RC (level 1 also post) | `e2e/release/prevalence-filter.spec.ts` |
| `prevalence.reset-filter`            | Prevalence reset filter button                          | 14        | RC                     | `e2e/release/prevalence-filter.spec.ts` |
| `prevalence.small-screen`            | Prevalence figures on a small screen                    | 15        | RC (evidence)          | manual                                  |
| `prevalence.change-language`         | Prevalence change language                              | 16        | RC                     | pending #128                            |
| `prevalence.filter-above-graph`      | Prevalence filter above the graph                       | 17        | RC                     | pending #128                            |
| `prevalence.share-link`              | Prevalence share link button                            | 18        | RC                     | pending #129                            |
| `amr.trend-info-button`              | AMR trend graph information button                      | 19        | RC                     | pending #130                            |
| `amr.filter`                         | AMR trend and substance graph data filter, per organism | 20-29     | RC (level 1 also post) | pending #130                            |
| `explanation.cut-off-table`          | Explanation page cut-off tables, de and en              | 30-36     | RC + post              | pending #131                            |
| `explanation.cut-off-title-language` | Cut-off table titles are in the page language           | 30-36     | -                      | manual                                  |
