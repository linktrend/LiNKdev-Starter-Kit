# Contributing to LiNKdev Starter Kit

Thank you for your interest in contributing to the LiNKdev Starter Kit! This document provides guidelines for contributing to this project.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- Git

### Development Setup

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/your-username/linkdev-starter-kit.git
   cd linkdev-starter-kit
   ```
3. **Install** dependencies:
   ```bash
   pnpm install
   ```
4. **Start** development servers:
   ```bash
   # Web app
   pnpm dev:web
   
   # Mobile app (in another terminal)
   pnpm dev:mobile
   ```

## 🌿 Branching Strategy

### Branch Naming

Use descriptive branch names with prefixes:

- `feat/` - New features
- `fix/` - Bug fixes
- `chore/` - Maintenance tasks
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

### Examples

```bash
feat/user-authentication
fix/mobile-navigation-bug
chore/update-dependencies
docs/api-documentation
refactor/component-structure
```

## 🔄 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feat/your-feature-name
```

### 2. Make Changes

- Follow the existing code style and patterns
- Write tests for new functionality
- Update documentation as needed
- Follow the design system guidelines

### 3. Quality Gates

Before committing, ensure all quality gates pass:

```bash
# Web application
pnpm verify:web

# Mobile application
pnpm test:mobile

# E2E tests (if applicable)
pnpm e2e:web
```

### 4. Commit Changes

Use [Conventional Commits](https://conventionalcommits.org/) format:

```bash
# Format: type(scope): description
git commit -m "feat(web): add user dashboard component"
git commit -m "fix(mobile): resolve navigation state issue"
git commit -m "chore(deps): update tailwindcss to v3.4.5"
```

### 5. Push and Create PR

```bash
git push origin feat/your-feature-name
```

Then create a Pull Request on GitHub.

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] All quality gates pass (`pnpm verify:web && pnpm test:mobile`)
- [ ] Code follows project conventions
- [ ] Tests are added/updated for new functionality
- [ ] Documentation is updated if needed
- [ ] Commit messages follow conventional commits format
- [ ] Branch is up to date with main

### PR Description

Include:

1. **Summary** - Brief description of changes
2. **Type** - feat/fix/chore/docs/refactor
3. **Testing** - How to test the changes
4. **Breaking Changes** - Any breaking changes (if applicable)
5. **Screenshots** - For UI changes

### Example PR Description

```markdown
## Summary
Adds user authentication flow to the web application.

## Type
feat

## Changes
- Added sign-in/sign-up pages
- Implemented Supabase auth integration
- Added protected route middleware
- Created user profile management

## Testing
1. Run `pnpm dev:web`
2. Navigate to `/signin`
3. Test sign-up flow
4. Verify protected routes redirect to sign-in

## Breaking Changes
None
```

## 🎨 Code Style Guidelines

### TypeScript

- Use strict type checking
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for exported functions

### React Components

- Use functional components with hooks
- Prefer composition over inheritance
- Use the design system components from `@starter/ui`
- Follow the established patterns in the codebase

### Design System

- Use design tokens instead of raw values
- Import components from `@starter/ui` package
- Follow the ESLint rules for design system enforcement
- No direct primitive imports (use `@starter/ui`)

### File Organization

- Place components in appropriate directories
- Use descriptive file names
- Group related files together
- Follow the established folder structure

## 🧪 Testing Guidelines

### Web Application

- Write unit tests with Vitest
- Test component behavior and user interactions
- Use Testing Library for React components
- Write E2E tests with Playwright for critical flows

### Mobile Application

- Write unit tests with Jest
- Test component rendering and behavior
- Use React Native Testing Library
- Test navigation and state management

### Test Requirements

- New features must include tests
- Bug fixes should include regression tests
- Aim for meaningful test coverage
- Tests should be fast and reliable

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for exported functions
- Include parameter and return type descriptions
- Document complex business logic
- Keep comments up to date with code changes

### README Updates

- Update README.md for significant changes
- Keep installation and setup instructions current
- Document new features and capabilities
- Include examples for new functionality

## 🐛 Bug Reports

When reporting bugs, include:

1. **Description** - Clear description of the issue
2. **Steps to Reproduce** - Detailed steps to reproduce
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Environment** - OS, Node version, browser, etc.
6. **Screenshots** - If applicable

## 💡 Feature Requests

When suggesting features:

1. **Use Case** - Describe the problem it solves
2. **Proposed Solution** - How you envision it working
3. **Alternatives** - Other solutions you've considered
4. **Additional Context** - Any other relevant information

## 🔍 Code Review Process

### For Contributors

- Address all review feedback
- Be responsive to questions
- Keep PRs focused and manageable
- Update documentation as needed

### For Reviewers

- Be constructive and helpful
- Focus on code quality and maintainability
- Check that tests are adequate
- Verify documentation is updated

## 📞 Getting Help

- **Issues** - Use GitHub Issues for bugs and feature requests
- **Discussions** - Use GitHub Discussions for questions
- **Documentation** - Check the `/docs` folder for detailed guides

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to LiNKdev Starter Kit! 🎉
