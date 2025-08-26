package com.iwms.service.impl;

import com.iwms.entity.FileTask;
import com.iwms.repository.FileTaskRepository;
import com.iwms.service.FileTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * 文件任务服务实现类
 */
@Service
public class FileTaskServiceImpl implements FileTaskService {

    @Autowired
    private FileTaskRepository fileTaskRepository;

    @Override
    public FileTask createRenameTask(String sourcePath, String targetPath, MultipartFile mappingFile, 
                                   String taskName, String description) {
        
        // 验证源路径
        if (!Files.exists(Paths.get(sourcePath))) {
            throw new IllegalArgumentException("源路径不存在: " + sourcePath);
        }
        
        // 创建目标目录
        try {
            Files.createDirectories(Paths.get(targetPath));
        } catch (Exception e) {
            throw new RuntimeException("无法创建目标目录: " + e.getMessage());
        }
        
        // 保存映射文件
        String mappingFilePath = null;
        if (mappingFile != null && !mappingFile.isEmpty()) {
            try {
                String fileName = mappingFile.getOriginalFilename();
                Path uploadPath = Paths.get("uploads", "mappings");
                Files.createDirectories(uploadPath);
                Path filePath = uploadPath.resolve(fileName);
                mappingFile.transferTo(filePath.toFile());
                mappingFilePath = filePath.toString();
            } catch (Exception e) {
                throw new RuntimeException("保存映射文件失败: " + e.getMessage());
            }
        }
        
        // 创建任务
        FileTask task = new FileTask();
        task.setTaskName(taskName != null ? taskName : "文件重命名任务");
        task.setTaskType("RENAME");
        task.setDescription(description);
        task.setSourcePath(sourcePath);
        task.setTargetPath(targetPath);
        task.setMappingFilePath(mappingFilePath);
        task.setStatus(FileTask.TaskStatus.PENDING);
        
        return fileTaskRepository.save(task);
    }

    @Override
    public FileTask createCompressTask(String sourcePath, String targetPath, Integer maxWidth, 
                                     Integer maxHeight, Double quality, String taskName, String description) {
        
        // 验证源路径
        if (!Files.exists(Paths.get(sourcePath))) {
            throw new IllegalArgumentException("源路径不存在: " + sourcePath);
        }
        
        // 创建目标目录
        try {
            Files.createDirectories(Paths.get(targetPath));
        } catch (Exception e) {
            throw new RuntimeException("无法创建目标目录: " + e.getMessage());
        }
        
        // 创建任务
        FileTask task = new FileTask();
        task.setTaskName(taskName != null ? taskName : "图片压缩任务");
        task.setTaskType("COMPRESS");
        task.setDescription(description);
        task.setSourcePath(sourcePath);
        task.setTargetPath(targetPath);
        task.setStatus(FileTask.TaskStatus.PENDING);
        
        return fileTaskRepository.save(task);
    }

    @Override
    public Page<FileTask> getAllTasks(Pageable pageable) {
        return fileTaskRepository.findAll(pageable);
    }

    @Override
    public FileTask getTaskById(Long id) {
        Optional<FileTask> task = fileTaskRepository.findById(id);
        if (task.isPresent()) {
            return task.get();
        } else {
            throw new RuntimeException("任务不存在: " + id);
        }
    }

    @Override
    @Async
    public void startTask(Long id) {
        FileTask task = getTaskById(id);
        
        if (task.getStatus() != FileTask.TaskStatus.PENDING) {
            throw new RuntimeException("任务状态不允许启动: " + task.getStatus());
        }
        
        task.start();
        fileTaskRepository.save(task);
        
        try {
            // 根据任务类型执行不同的处理逻辑
            if ("RENAME".equals(task.getTaskType())) {
                executeRenameTask(task);
            } else if ("COMPRESS".equals(task.getTaskType())) {
                executeCompressTask(task);
            }
            
            task.complete();
            fileTaskRepository.save(task);
            
        } catch (Exception e) {
            task.fail(e.getMessage());
            fileTaskRepository.save(task);
            throw new RuntimeException("任务执行失败: " + e.getMessage());
        }
    }

    @Override
    public void cancelTask(Long id) {
        FileTask task = getTaskById(id);
        
        if (task.getStatus() == FileTask.TaskStatus.RUNNING) {
            task.cancel();
            fileTaskRepository.save(task);
        } else {
            throw new RuntimeException("任务状态不允许取消: " + task.getStatus());
        }
    }

    @Override
    public void deleteTask(Long id) {
        FileTask task = getTaskById(id);
        
        if (task.getStatus() == FileTask.TaskStatus.RUNNING) {
            throw new RuntimeException("正在运行的任务不能删除");
        }
        
        fileTaskRepository.delete(task);
    }

    @Override
    public Object getTaskStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalTasks = fileTaskRepository.count();
        long pendingTasks = fileTaskRepository.countByStatus(FileTask.TaskStatus.PENDING);
        long runningTasks = fileTaskRepository.countByStatus(FileTask.TaskStatus.RUNNING);
        long completedTasks = fileTaskRepository.countByStatus(FileTask.TaskStatus.COMPLETED);
        long failedTasks = fileTaskRepository.countByStatus(FileTask.TaskStatus.FAILED);
        
        stats.put("totalTasks", totalTasks);
        stats.put("pendingTasks", pendingTasks);
        stats.put("runningTasks", runningTasks);
        stats.put("completedTasks", completedTasks);
        stats.put("failedTasks", failedTasks);
        
        return stats;
    }

    @Override
    public Object getTaskProgress(Long id) {
        FileTask task = getTaskById(id);
        
        Map<String, Object> progress = new HashMap<>();
        progress.put("taskId", task.getId());
        progress.put("status", task.getStatus());
        progress.put("progress", task.getProgress());
        progress.put("totalFiles", task.getTotalFiles());
        progress.put("processedFiles", task.getProcessedFiles());
        progress.put("successCount", task.getSuccessCount());
        progress.put("failedCount", task.getFailedCount());
        progress.put("skippedCount", task.getSkippedCount());
        
        return progress;
    }

    @Override
    public String getReportPath(Long id) {
        FileTask task = getTaskById(id);
        
        if (task.getReportPath() == null) {
            throw new RuntimeException("任务报告不存在");
        }
        
        return task.getReportPath();
    }

    /**
     * 执行重命名任务
     */
    private void executeRenameTask(FileTask task) {
        // TODO: 实现文件重命名逻辑
        // 这里可以调用现有的文件处理逻辑
        System.out.println("执行重命名任务: " + task.getTaskName());
        
        // 模拟处理过程
        task.setTotalFiles(100);
        task.setProcessedFiles(100);
        task.setSuccessCount(95);
        task.setFailedCount(3);
        task.setSkippedCount(2);
        
        // 生成报告路径
        String reportPath = "reports/rename_" + task.getId() + "_" + System.currentTimeMillis() + ".csv";
        task.setReportPath(reportPath);
    }

    /**
     * 执行压缩任务
     */
    private void executeCompressTask(FileTask task) {
        // TODO: 实现图片压缩逻辑
        // 这里可以调用现有的图片压缩逻辑
        System.out.println("执行压缩任务: " + task.getTaskName());
        
        // 模拟处理过程
        task.setTotalFiles(50);
        task.setProcessedFiles(50);
        task.setSuccessCount(48);
        task.setFailedCount(1);
        task.setSkippedCount(1);
        
        // 生成报告路径
        String reportPath = "reports/compress_" + task.getId() + "_" + System.currentTimeMillis() + ".csv";
        task.setReportPath(reportPath);
    }
}
