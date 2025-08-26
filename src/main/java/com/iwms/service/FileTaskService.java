package com.iwms.service;

import com.iwms.entity.FileTask;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

/**
 * 文件任务服务接口
 */
public interface FileTaskService {
    
    /**
     * 创建文件重命名任务
     */
    FileTask createRenameTask(String sourcePath, String targetPath, MultipartFile mappingFile, 
                            String taskName, String description);
    
    /**
     * 创建图片压缩任务
     */
    FileTask createCompressTask(String sourcePath, String targetPath, Integer maxWidth, 
                              Integer maxHeight, Double quality, String taskName, String description);
    
    /**
     * 获取所有任务
     */
    Page<FileTask> getAllTasks(Pageable pageable);
    
    /**
     * 根据ID获取任务
     */
    FileTask getTaskById(Long id);
    
    /**
     * 启动任务
     */
    void startTask(Long id);
    
    /**
     * 取消任务
     */
    void cancelTask(Long id);
    
    /**
     * 删除任务
     */
    void deleteTask(Long id);
    
    /**
     * 获取任务统计信息
     */
    Object getTaskStats();
    
    /**
     * 获取任务进度
     */
    Object getTaskProgress(Long id);
    
    /**
     * 获取任务报告路径
     */
    String getReportPath(Long id);
}
