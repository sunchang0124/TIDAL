When you're ready to release a new version, perform the following steps:

- Update CHANGELOG.md, moving the items below the `Unreleased` heading below your new version
- Run `yarn version` (`--major`, `--minor` or `--patch`)
- Push the `master` branch with this new version to have a snapshot build published (as `@next`)
- `git push --tags` to have the actual new version published

# Design principles

- The store only contains nodes that are on the Pod - any queued up changes are stored in tripledoc's closures. By keeping them separate, we can know when changes still have to be synced, leave the way open for offline-first support in the future, and have clear code paths: the store can only be updated through the UpdateManager or Fetcher, the rest through library calls.
- The primary data structure is the URL, i.e. a plain string. This is used to refer to nodes in the Linked Data graph, and library consumers should not have to manually convert between different data structures. Instead, they have to explicitly indicate whether they expect node references or literal data through the methods they use. Likewise, try not to expose N3-internal data structures through the public API.
- In general Tripledoc tries to avoid "magic", i.e. method signatures from which it is not obvious in isolation what they do.
- We use semver, and hence communicate breaking changes to the public API (i.e. methods documented in the README) through major version increases.
- Release early, release often. It is preferable to have a minimal, fully documented API, with unit tests, rather than trying to predict all possible use cases in advance and unnecessarily increasing the learning curve.
