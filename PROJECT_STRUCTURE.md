# 📁 IWMS Project Structure

This document describes the optimized file structure of the IWMS project, designed to be GitHub-ready and follow best practices for open-source projects.

## 🏗️ Directory Structure

```
IWMS/
├── 📚 docs/                           # Documentation directory
│   ├── 📖 README.md                   # Documentation index
│   ├── 🌍 en/                         # English documentation (future)
│   │   └── README.md                  # English docs placeholder
│   └── 🇨🇳 zh-CN/                     # Chinese documentation
│       ├── CHANGELOG.md               # 功能更新总结
│       ├── FILE_FILTERING.md          # 图片文件过滤功能说明
│       ├── IMAGE_COMPRESSION.md       # 图片压缩功能说明
│       ├── MAPPING_EXAMPLES.md        # 示例映射表
│       ├── PROJECT_SUMMARY.md         # 项目总结
│       ├── QUICK_START.md             # 快速启动指南
│       ├── ROADMAP.md                 # 功能规划
│       └── UI_PREVIEW.md              # 界面预览说明
├── ⚡ electron/                       # Electron main process
│   ├── main.js                        # Main process entry
│   └── preload.js                     # Preload script
├── 🎨 src/                            # Vue frontend source
│   ├── App.vue                        # Main application component
│   └── main.js                        # Vue application entry
├── 🖼️ assets/                         # Static assets
├── 🌐 public/                         # Public assets
├── 📦 dist-electron/                  # Electron build output
├── 📋 .gitignore                      # Git ignore rules
├── 📜 LICENSE                         # MIT License
├── 📋 CHANGELOG.md                    # Project changelog
├── 🤝 CONTRIBUTING.md                 # Contribution guidelines
├── 📜 CODE_OF_CONDUCT.md              # Community behavior standards
├── 🔒 SECURITY.md                     # Security policy
├── 📁 PROJECT_STRUCTURE.md            # This file
├── 🚀 start.sh                        # Development startup script
├── 🧪 iwms-demo.js                    # Feature demo script
├── 📊 performance-test.js             # Performance testing script
├── 📦 package.json                    # Project configuration
├── 📦 package-lock.json               # Dependency lock file
├── ⚙️ vite.config.js                  # Vite build configuration
├── 🌐 index.html                      # Main HTML file
└── 📖 README.md                       # Main project README
```

## 🔄 File Organization Changes

### Before Optimization
- All documentation files were scattered in the root directory
- Chinese filenames made it difficult for international contributors
- No clear documentation structure
- Missing essential GitHub files

### After Optimization
- **Organized Documentation**: All docs moved to `docs/` directory
- **Language Separation**: Chinese docs in `docs/zh-CN/`, English docs in `docs/en/`
- **Standardized Naming**: English filenames for better internationalization
- **GitHub Ready**: Added essential files like `.gitignore`, `LICENSE`, `CONTRIBUTING.md`

## 📚 Documentation Structure

### Root Level
- **README.md**: Main project overview in English
- **CHANGELOG.md**: Version history and changes
- **CONTRIBUTING.md**: How to contribute to the project
- **CODE_OF_CONDUCT.md**: Community behavior standards
- **SECURITY.md**: Security policy and vulnerability reporting
- **PROJECT_STRUCTURE.md**: This file, explaining the structure

### Documentation Directory (`docs/`)
- **README.md**: Documentation index and navigation
- **en/**: English documentation (placeholder for future)
- **zh-CN/**: Complete Chinese documentation

### Chinese Documentation (`docs/zh-CN/`)
- **Getting Started**: `QUICK_START.md`, `MAPPING_EXAMPLES.md`
- **User Guides**: `IMAGE_COMPRESSION.md`, `FILE_FILTERING.md`, `UI_PREVIEW.md`
- **Development**: `PROJECT_SUMMARY.md`, `CHANGELOG.md`, `ROADMAP.md`

## 🎯 Benefits of New Structure

### For Contributors
- Clear separation of concerns
- Easy to find relevant documentation
- Standardized contribution process
- Professional project appearance

### For Users
- Organized documentation by topic
- Easy navigation between languages
- Professional and trustworthy appearance
- Clear getting started path

### For Maintainers
- Easier to manage documentation
- Clear contribution guidelines
- Professional project standards
- Better community engagement

## 🔧 File Naming Conventions

### Documentation Files
- Use descriptive English names
- Follow kebab-case for multi-word names
- Group related functionality together
- Maintain consistent naming patterns

### Source Code Files
- Keep original structure for functionality
- Use descriptive names for new files
- Follow project-specific conventions
- Maintain backward compatibility

## 📖 Documentation Standards

### Content Organization
- Clear hierarchy with proper headings
- Consistent formatting and style
- Practical examples and use cases
- Regular updates and maintenance

### Language Support
- **Primary**: Chinese (Simplified) - Complete coverage
- **Secondary**: English - In development
- **Future**: Additional languages based on demand

## 🚀 Getting Started with New Structure

### For New Contributors
1. Read `README.md` for project overview
2. Check `CONTRIBUTING.md` for guidelines
3. Review `docs/README.md` for documentation structure
4. Choose appropriate language directory

### For Documentation Updates
1. Identify the correct language directory
2. Follow existing naming conventions
3. Update both language versions when possible
4. Maintain consistent formatting

### For Project Maintenance
1. Keep documentation synchronized
2. Update changelog for all changes
3. Maintain contribution guidelines
4. Regular structure reviews

## 🔮 Future Improvements

### Planned Enhancements
- Complete English documentation translation
- Interactive documentation with examples
- Video tutorials and screenshots
- Community-contributed translations

### Structure Evolution
- Plugin system documentation
- API reference documentation
- Developer guides and tutorials
- Community showcase and examples

## 📞 Support and Questions

If you have questions about the project structure:

- Check the main [README.md](README.md)
- Review the [documentation index](docs/README.md)
- Open an issue on GitHub
- Contact the project maintainers

---

**This structure makes IWMS more professional, accessible, and maintainable for the open-source community!** 🎉
