package com.iwms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 文件任务请求DTO
 */
public class FileTaskRequest {
    
    @NotBlank(message = "任务名称不能为空")
    private String taskName;
    
    @NotBlank(message = "任务类型不能为空")
    private String taskType;
    
    private String description;
    
    @NotBlank(message = "源路径不能为空")
    private String sourcePath;
    
    @NotBlank(message = "目标路径不能为空")
    private String targetPath;
    
    private String mappingFilePath;
    
    // 压缩任务参数
    private Integer maxWidth;
    private Integer maxHeight;
    private Double quality;
    
    // 构造函数
    public FileTaskRequest() {}
    
    public FileTaskRequest(String taskName, String taskType, String sourcePath, String targetPath) {
        this.taskName = taskName;
        this.taskType = taskType;
        this.sourcePath = sourcePath;
        this.targetPath = targetPath;
    }
    
    // Getter和Setter方法
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
    
    public Integer getMaxWidth() { return maxWidth; }
    public void setMaxWidth(Integer maxWidth) { this.maxWidth = maxWidth; }
    
    public Integer getMaxHeight() { return maxHeight; }
    public void setMaxHeight(Integer maxHeight) { this.maxHeight = maxHeight; }
    
    public Double getQuality() { return quality; }
    public void setQuality(Double quality) { this.quality = quality; }
}
