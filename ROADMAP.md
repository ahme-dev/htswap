# Roadmap

Plans and tasks to do, in order.

## Core Testing
- **Failure case coverage** - expand tests for edge cases and error scenarios
- **Default behavior validation** - verify handling when targets don't exist (aliases, merge modes)
- **Timeout handling** - add timeout test cases
- **Inline JS variables** - test variable declarations between multiple swaps
- **Redirect handling** - test redirects with history integration

## Error Handling
- **HTTP error responses** - handle 4xx/5xx with custom swap targets (`data-htfail`)
- **Request blocking** - block outside/unauthorized requests

## Navigation & History
- **History back button** - correct behavior with potential caching (earlier page override may destroy content)
- **Reverse Swap logic** - swap mode reversing may be needed for backstep functionality
- **DOM caching** - evaluate necessity and implement if needed

## Developer Experience
- **Debug UI/console** - add debugging tools for development

## Performance & Optimization
- **Deduplication** - prevent duplicate requests
- **Preload anchors** - fetch anchor content on page load for instant swaps
- **Intersection observer** - implement lazy load/scroll-based loading

## Accessibility (if feasiable)
- **Focus management** - maintain proper focus context during swaps
- **Screen reader support** - ARIA attributes and semantic markup
- **Live/announcement regions** - implement for dynamic content updates