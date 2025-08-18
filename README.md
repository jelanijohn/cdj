# cdj - Change Directory Jam

[![npm version](https://img.shields.io/npm/v/cdj.svg)](https://www.npmjs.com/package/cdj)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightning-fast CLI tool for navigating project directories using intelligent character-by-character matching and auto-generated bash aliases.

## Features

- **Smart Navigation**: Navigate to any project using minimal keystrokes
- **Character Matching**: Type characters to progressively filter directories
- **Numeric Selection**: Use numbers to select from multiple matches (e.g., `p2` for second match starting with 'p')
- **Auto-generated Aliases**: Generate bash aliases for your entire project tree with `cdj -g`
- **Hidden Directory Support**: Dot-prefixed (`.env`, `.config`) directories are navigable, but ranked lower than alphanumeric names
- **Shell Integration**: Seamless integration with bash and zsh
- **Zero Runtime Dependencies**: Pure bash implementation for maximum performance

## Installation

```bash
npm install -g cdj
```

The installation automatically adds the shell hook to your `.bashrc` or `.zshrc` file.

### Manual Hook Installation

If automatic installation doesn't work, manually add the hook:

```bash
# For bash
cdj hook >> ~/.bashrc
source ~/.bashrc

# For zsh
cdj hook >> ~/.zshrc
source ~/.zshrc
```

## Usage

### Basic Navigation

The `cdj` command uses intelligent character-by-character matching:

1. Each character filters directories starting with that character (case-insensitive)
2. Numbers select from multiple matches (1-9)
3. The first match is selected by default

Example directory structure:
```
~/Projects/
  ├── .config/
  ├── app-frontend/
  ├── app-backend/
  ├── crm/
  ├── portfolio/
  ├   └──alpha/
  └── project/
      └── beta/
```

Navigation examples:
- `cdj` → `~/Projects/` (base directory - configurable, see below)
- `cdj a` → `~/Projects/app-backend/` (first alphabetically)
- `cdj a2` → `~/Projects/app-frontend/` (second match)
- `cdj c` → `~/Projects/crm/`
- `cdj p` → `~/Projects/portfolio/` (first 'p' match)
- `cdj p2` → `~/Projects/project/` (second 'p' match)
- `cdj pa` → `~/Projects/portfolio/alpha/`
- `cdj p2b` → `~/Projects/project/beta/`
- `cdj .` → `~/Projects/.config/`
- `cdj paxyz` → `~/Projects/portfolio/alpha/` (graceful failure)

### Generate Aliases

Alias generation is built into `cdj` as an option:

```bash
# Generate aliases for current directory
cdj -g
cdj --gen-aliases
```

### Alias Generation Options

The `cdj -g` / `--gen-aliases` option accepts three parameters:

1. **BASE_DIR** (default: current directory): Root directory for alias generation
2. **PREFIX** (default: "cdj"): Prefix for all generated aliases
3. **MAX_DEPTH** (default: 3): Maximum directory depth for alias generation

```bash
# Generate aliases for a specific directory with custom prefix and depth
cdj -g /path/to/directory myprefix 2

# Add to your shell config
cdj -g ~/Projects cdj 2 >> ~/.bashrc
source ~/.bashrc
```

Generated aliases follow this pattern:
- First alphabetic character becomes the suffix
- Duplicates get numeric suffixes (2, 3, etc.)
- Nested directories extend the parent alias
- Dot-prefixed directories are included with the dot removed and rules above but given lower priority in ordering

Example output:
```bash
alias cdj='cd "/home/user/Projects"'
alias cdja='cd "/home/user/Projects/app-backend"'
alias cdja2='cd "/home/user/Projects/app-frontend"'
alias cdjp='cd "/home/user/Projects/portfolio"'
alias cdjp2='cd "/home/user/Projects/project"'
alias cdjc='cd "/home/user/Projects/crm"'
alias cdjc2='cd "/home/user/Projects/.config"'   # hidden dir uses first char after dot, but lower priority
```

## Configuration

### Base Directory

By default, `cdj` uses `~/Projects` as the base directory.\
You can override this with an environment variable:

```bash
export CDJ_BASE=~/Workspaces
```

Add that line to your shell config (`~/.bashrc` or `~/.zshrc`) to make
it persistent.

## Examples

### Quick Project Switching

```bash
# Working on multiple projects
cdj w        # Navigate to 'website' project
cdj m        # Navigate to 'mobile-app' project
cdj b        # Navigate to 'backend' project
```

### Deep Navigation

```bash
# Navigate to nested directories
cdj ws       # website/src
cdj wsc      # website/src/components
```

### Setting Up Project Aliases

```bash
# Generate and apply aliases
cdj -g ~/Projects cdj 2 >> ~/.bashrc
source ~/.bashrc

# Now use aliases directly
cdjw    # cd to website project
cdjm    # cd to mobile-app project
```

## Shell Compatibility

- ✅ **Bash**: Full support
- ✅ **Zsh**: Full support
- ⚠️ **Fish**: Requires manual adaptation of the shell hook
- ⚠️ **PowerShell**: Not supported

## Uninstallation

```bash
npm uninstall -g cdj
```

This automatically removes the shell hooks from your configuration files.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Jelani John

## Author

**Jelani John**

## Keywords

`cd`, `alias`, `navigation`, `bash`, `productivity`, `cli`, `terminal`