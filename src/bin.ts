#!/usr/bin/env node
// React ships a much slower development build; default the shipped CLI to
// production unless the caller set NODE_ENV. Static imports are hoisted, so
// the app must be loaded dynamically after the assignment.
process.env.NODE_ENV ??= "production"

await import("./index.js")
