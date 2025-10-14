# Release Process

This document explains how to create releases for the Holdfire application using the automated GitHub Actions workflows.

## Release Scripts

The following release scripts have been added to `package.json`:

- `npm run release`: Builds and publishes the app to all configured platforms, always publishing
- `npm run release:github`: Builds and publishes the app specifically to GitHub releases

## GitHub Actions Workflows

### Automated Release (on Git Tags)

When you push a tag that matches the pattern `v*` (e.g., `v1.0.0`), the `release.yml` workflow will automatically:

1. Check out the code
2. Set up Node.js environment
3. Install dependencies
4. Build the Electron app for macOS, Linux, and Windows
5. Create a GitHub release with the built artifacts

To create an automated release:
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Manual Release

The `manual-release.yml` workflow can be triggered manually from the GitHub UI:

1. Go to the "Actions" tab in your repository
2. Select "Manual Release" workflow
3. Click "Run workflow"
4. Enter the version number (e.g., `1.0.0`)
5. Optionally mark as pre-release
6. The workflow will build and create a release with the specified version

## Prerequisites

For the release process to work properly, you need:

1. A GitHub personal access token with appropriate permissions
2. The `GITHUB_TOKEN` secret properly configured in your repository settings
3. Proper signing certificates for macOS (if applicable)

## Building Locally

To build the app locally for testing before releasing:

```bash
# Build for current platform
npm run electron:build

# Build for specific platforms
npm run electron:build:mac    # macOS
npm run electron:build:win    # Windows
npm run electron:build:linux  # Linux
```