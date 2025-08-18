# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CDJ (Change Directory Fast) is a CLI tool for quick project navigation using bash aliases. It provides intelligent directory navigation using single-character shortcuts and automatic alias generation.

## Architecture

### Core Components

1. **bin/cdj** - Main navigation script
   - Implements smart directory navigation using character-by-character matching
   - Supports numeric selection when multiple matches exist (e.g., "p1" selects first match starting with 'p')
   - Base directory: ~/Projects
   - Provides shell hook integration for seamless `cd` functionality

2. **bin/cdj-generate-aliases** - Alias generation utility
   - Recursively generates bash aliases for project directories
   - Configurable depth limit (default: 3 levels)
   - Smart naming: first alphabetic character, with numeric suffixes for duplicates
   - Sorts directories case-insensitively, hidden directories last

3. **Installation Scripts**
   - **scripts/postinstall.js**: Automatically installs shell hook to .zshrc/.bashrc
   - **scripts/preuninstall.js**: Cleanly removes shell hooks on uninstall
   - Respects CI environments and npm ignore-scripts flag

### Shell Integration

The tool works by:
1. Installing a shell function that wraps the cdj command
2. The wrapper executes cdj to get the target directory path
3. Then performs the actual `cd` to that directory

Hook pattern:
```bash
cdj() {
  local target
  target="$(command -v cdj >/dev/null 2>&1 && cdj "$@" || npx -y cdj "$@")" || return 1
  cd "$target" || return 1
}
```

## Common Commands

```bash
# Install globally
npm install -g cdj

# Generate shell hook manually
cdj hook >> ~/.zshrc  # or ~/.bashrc

# Navigate to projects
cdj          # Go to ~/Projects
cdj p        # Navigate to first directory starting with 'p'
cdj p2       # Navigate to second directory starting with 'p'

# Generate aliases for current directory
cdj-generate-aliases
cdj-generate-aliases /path/to/projects myprefix 2  # Custom base, prefix, depth
```

## Development Notes

- Pure bash implementation for performance
- No external dependencies in runtime scripts
- Node.js used only for install/uninstall lifecycle hooks
- Compatible with bash, zsh (fish requires adaptation)