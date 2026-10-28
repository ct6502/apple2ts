# Local deepmerge security patch

This package is based on upstream `deepmerge` 4.3.1. Its CommonJS build rejects
`__proto__` keys in both merge loops, following upstream security fix commit
[`c5ad573`](https://github.com/cristianfloresRC/deepmerge/commit/c5ad573121574db1c625b0aabcc6114ed7df6c5a).
The local version suffix identifies this patched copy; it is not an upstream npm
release. Keep the MIT license from upstream with this package.
