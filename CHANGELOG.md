# 📋 Changelog

All notable changes to the IWMS project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Enhanced documentation structure
- GitHub-ready project organization
- Contributing guidelines
- Issue templates

### Changed
- Reorganized documentation into `docs/` directory
- Updated README.md with English content
- Improved project structure for GitHub

## [1.0.0] - 2024-12-XX

### Added
- **Core IWMS Functionality**
  - Excel mapping table support (.xlsx, .xls, .csv)
  - Intelligent filename parsing (main name, sequence, extension)
  - Batch file processing with large file support
  - Preview functionality before execution
  - Conflict handling strategies (skip, overwrite, append suffix)
  - Recursive folder scanning option
  - Detailed CSV processing reports

- **Image Compression Features**
  - Smart image compression by longest side pixel count
  - Multi-threaded parallel processing
  - Support for mainstream image formats
  - High-quality compression algorithms
  - Automatic fallback to original file on compression failure

- **User Experience**
  - Wizard-style 4-step operation flow
  - Real-time progress feedback
  - Data validation and error handling
  - CSV export for preview and execution results

### Technical Features
- **Cross-platform Support**: macOS, Windows, Linux
- **Modern UI**: Element Plus component library
- **Security Architecture**: IPC communication with process isolation
- **Performance Optimization**: Large file volume support, preview/execution separation

### Architecture
- **Frontend**: Vue 3 + Composition API + Element Plus + Vite
- **Desktop**: Electron
- **File Processing**: Node.js + fs-extra + fast-glob + xlsx
- **Image Processing**: Sharp library

## [0.9.0] - 2024-XX-XX

### Added
- Initial project setup
- Basic Electron + Vue 3 structure
- File processing foundation

### Changed
- Project architecture planning
- Technology stack selection

## [0.8.0] - 2024-XX-XX

### Added
- Project concept and requirements
- Feature planning and roadmap

---

## 📝 Version History

- **v1.0.0**: Complete IWMS core functionality with image compression
- **v0.9.0**: Project foundation and architecture setup
- **v0.8.0**: Initial planning and concept development

## 🔮 Upcoming Releases

### v1.1.0 (Planned)
- Standalone image compression tool
- Enhanced compression options
- Batch compression parameter settings

### v1.2.0 (Planned)
- Batch format conversion
- Support for more output formats
- Advanced file processing options

### v1.3.0 (Planned)
- File organization tools
- Smart file classification
- Advanced filtering capabilities

### v2.0.0 (Long-term)
- File synchronization tools
- File backup functionality
- File search capabilities

## 📊 Release Statistics

- **Total Releases**: 3
- **Major Features**: 2
- **Bug Fixes**: Multiple
- **Documentation Updates**: Continuous

---

**Note**: For detailed information about each release, check the [Chinese changelog](docs/zh-CN/CHANGELOG.md) or individual release notes on GitHub.
