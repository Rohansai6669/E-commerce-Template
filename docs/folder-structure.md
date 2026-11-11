# Directory Guidelines

This template enforces a strict separation of concerns through nested directory layers:

- `src/app`: Page routers, API route definitions, layouts
- `src/components`: Reusable view layer components (grouped into atoms, molecules, organisms)
- `src/core`: Internal engine abstractions (auth, cache, config, errors, validation, security)
- `src/modules`: Vertical business domains containing domain-specific code
- `src/providers`: Application context distributors
- `scripts`: CLI tasks automation
