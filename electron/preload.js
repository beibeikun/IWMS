const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectExcelFile: () => ipcRenderer.invoke('select-excel-file'),
  readExcelMapping: (filePath) => ipcRenderer.invoke('read-excel-mapping', filePath),
  scanFiles: (inputPath, recursive, fileTypes) => ipcRenderer.invoke('scan-files', inputPath, recursive, fileTypes),
  processFiles: (options) => ipcRenderer.invoke('process-files', options),
  exportResults: (results, outputPath) => ipcRenderer.invoke('export-results', results, outputPath),
  compressImage: (options) => ipcRenderer.invoke('compress-image', options),
  compressImagesBatch: (options) => ipcRenderer.invoke('compress-images-batch', options)
})
