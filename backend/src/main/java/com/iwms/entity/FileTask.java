package com.iwms.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * 文件处理任务实体
 */
@Entity
@Table(name = "file_tasks")
public class FileTask {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(nullable = false)
    private String taskName;
    
    @NotBlank
    @Column(nullable = false)
    private String taskType; // RENAME, COMPRESS, BATCH_PROCESS
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @NotBlank
    @Column(nullable = false)
    private String sourcePath;
    
    @Column
    private String targetPath;
    
    @Column
    private String mappingFilePath;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.PENDING;
    
    @Column
    private Integer totalFiles;
    
    @Column
    private Integer processedFiles;
    
    @Column
    private Integer successCount;
    
    @Column
    private Integer failedCount;
    
    @Column
    private Integer skippedCount;
    
    @Column(columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column
    private String reportPath;
    
    @NotNull
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column
    private LocalDateTime startedAt;
    
    @Column
    private LocalDateTime completedAt;
    
    @Column
    private Long executionTime; // 执行时间(毫秒)
    
    @Column
    private String createdBy = "system";
    
    // 枚举：任务状态
    public enum TaskStatus {
        PENDING,    // 等待中
        RUNNING,    // 执行中
        COMPLETED,  // 已完成
        FAILED,     // 失败
        CANCELLED   // 已取消
    }
    
    // 构造函数
    public FileTask() {}
    
    public FileTask(String taskName, String taskType, String sourcePath) {
        this.taskName = taskName;
        this.taskType = taskType;
        this.sourcePath = sourcePath;
    }
    
    // Getter和Setter方法
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTaskName() { return taskName; }
    public void setTaskName(String taskName) { this.taskName = taskName; }
    
    public String getTaskType() { return taskType; }
    public void setTaskType(String taskType) { this.taskType = taskType; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getSourcePath() { return sourcePath; }
    public void setSourcePath(String sourcePath) { this.sourcePath = sourcePath; }
    
    public String getTargetPath() { return targetPath; }
    public void setTargetPath(String targetPath) { this.targetPath = targetPath; }
    
    public String getMappingFilePath() { return mappingFilePath; }
    public void setMappingFilePath(String mappingFilePath) { this.mappingFilePath = mappingFilePath; }
    
    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }
    
    public Integer getTotalFiles() { return totalFiles; }
    public void setTotalFiles(Integer totalFiles) { this.totalFiles = totalFiles; }
    
    public Integer getProcessedFiles() { return processedFiles; }
    public void setProcessedFiles(Integer processedFiles) { this.processedFiles = processedFiles; }
    
    public Integer getSuccessCount() { return successCount; }
    public void setSuccessCount(Integer successCount) { this.successCount = successCount; }
    
    public Integer getFailedCount() { return failedCount; }
    public void setFailedCount(Integer failedCount) { this.failedCount = failedCount; }
    
    public Integer getSkippedCount() { return skippedCount; }
    public void setSkippedCount(Integer skippedCount) { this.skippedCount = skippedCount; }
    
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    
    public String getReportPath() { return reportPath; }
    public void setReportPath(String reportPath) { this.reportPath = reportPath; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    
    public Long getExecutionTime() { return executionTime; }
    public void setExecutionTime(Long executionTime) { this.executionTime = executionTime; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    // 业务方法
    public void start() {
        this.status = TaskStatus.RUNNING;
        this.startedAt = LocalDateTime.now();
    }
    
    public void complete() {
        this.status = TaskStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
        if (this.startedAt != null) {
            this.executionTime = java.time.Duration.between(this.startedAt, this.completedAt).toMillis();
        }
    }
    
    public void fail(String errorMessage) {
        this.status = TaskStatus.FAILED;
        this.errorMessage = errorMessage;
        this.completedAt = LocalDateTime.now();
        if (this.startedAt != null) {
            this.executionTime = java.time.Duration.between(this.startedAt, this.completedAt).toMillis();
        }
    }
    
    public void cancel() {
        this.status = TaskStatus.CANCELLED;
        this.completedAt = LocalDateTime.now();
    }
    
    public double getProgress() {
        if (totalFiles == null || totalFiles == 0) return 0.0;
        return (double) processedFiles / totalFiles * 100;
    }
}
