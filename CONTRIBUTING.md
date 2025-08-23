# 🤝 Contributing to IWMS

Thank you for your interest in contributing to IWMS! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch
4. **Make** your changes
5. **Test** your changes
6. **Commit** and **push** to your branch
7. **Open** a Pull Request

## 📋 Contribution Areas

### 🐛 Bug Reports
- Use the GitHub issue template
- Provide detailed reproduction steps
- Include system information and error logs
- Check if the issue has already been reported

### ✨ Feature Requests
- Describe the feature clearly
- Explain the use case and benefits
- Consider implementation complexity
- Check if the feature is already planned

### 📚 Documentation
- Fix typos and grammar errors
- Improve clarity and readability
- Add missing information
- Translate to other languages

### 🔧 Code Contributions
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass

## 🛠️ Development Setup

### Prerequisites
- Node.js 16.0 or higher
- npm or yarn package manager
- Git

### Local Development
```bash
# Clone your fork
git clone https://github.com/yourusername/IWMS.git
cd IWMS

# Install dependencies
npm install

# Start development mode
npm run electron:dev

# Run tests
npm test
```

## 📝 Code Style Guidelines

### JavaScript/TypeScript
- Use ES6+ features
- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for functions

### Vue Components
- Use Composition API
- Follow Vue 3 best practices
- Keep components focused and reusable
- Use proper prop validation

### CSS/Styling
- Use Element Plus design system
- Follow BEM methodology
- Keep styles scoped to components
- Use CSS variables for theming

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --grep "test name"
```

### Writing Tests
- Test both success and error cases
- Mock external dependencies
- Use descriptive test names
- Aim for good test coverage

## 📦 Building

### Development Build
```bash
npm run build
```

### Production Build
```bash
npm run electron:build
```

## 🔄 Pull Request Process

### Before Submitting
1. Ensure your code follows the style guidelines
2. Add tests for new functionality
3. Update documentation if needed
4. Test the build process

### Pull Request Template
- **Title**: Clear, descriptive title
- **Description**: Detailed explanation of changes
- **Type**: Bug fix, feature, documentation, etc.
- **Testing**: How you tested the changes
- **Screenshots**: If UI changes are involved

### Review Process
- Maintainers will review your PR
- Address any feedback or requested changes
- Ensure CI checks pass
- Be patient and responsive

## 📚 Documentation Standards

### Markdown Files
- Use clear, concise language
- Include practical examples
- Maintain consistent formatting
- Use proper heading hierarchy

### Code Examples
- Include complete, runnable examples
- Add comments explaining complex logic
- Use appropriate syntax highlighting
- Test examples before committing

## 🌐 Internationalization

### Adding New Languages
1. Create a new language directory in `docs/`
2. Translate all documentation files
3. Update language selection in main README
4. Add language-specific formatting considerations

### Translation Guidelines
- Maintain technical accuracy
- Consider cultural context
- Use consistent terminology
- Keep translations up to date

## 🐛 Issue Templates

### Bug Report
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 12.0]
- Node.js: [e.g., 16.0.0]
- IWMS Version: [e.g., 1.0.0]

## Additional Information
Any other context, logs, or screenshots
```

### Feature Request
```markdown
## Feature Description
Clear description of the requested feature

## Use Case
Why this feature would be useful

## Proposed Implementation
Any ideas on how to implement it

## Alternatives Considered
Other approaches you've considered

## Additional Context
Any other relevant information
```

## 📞 Getting Help

### Questions and Discussion
- Use GitHub Discussions for general questions
- Open an issue for bugs or feature requests
- Join our community chat (if available)

### Maintainer Contact
- Tag maintainers in issues/PRs when needed
- Be respectful and patient
- Provide all necessary information upfront

## 🎯 Contribution Ideas

### Good First Issues
- Documentation improvements
- Bug fixes with clear reproduction steps
- Small UI enhancements
- Test coverage improvements

### Advanced Contributions
- New feature implementations
- Performance optimizations
- Architecture improvements
- Plugin system development

## 📄 License

By contributing to IWMS, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributor hall of fame
- GitHub contributors list

---

**Thank you for contributing to IWMS!** 🎉

Your contributions help make this tool better for everyone in the community.
