package com.iwms.repository;

import com.iwms.entity.FileTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 文件任务数据访问层
 */
@Repository
public interface FileTaskRepository extends JpaRepository<FileTask, Long> {
    
    /**
     * 根据状态统计任务数量
     */
    long countByStatus(FileTask.TaskStatus status);
    
    /**
     * 根据任务类型查找任务
     */
    List<FileTask> findByTaskType(String taskType);
    
    /**
     * 根据状态查找任务
     */
    List<FileTask> findByStatus(FileTask.TaskStatus status);
    
    /**
     * 查找运行中的任务
     */
    @Query("SELECT t FROM FileTask t WHERE t.status = 'RUNNING'")
    List<FileTask> findRunningTasks();
    
    /**
     * 查找最近创建的任务
     */
    @Query("SELECT t FROM FileTask t ORDER BY t.createdAt DESC")
    List<FileTask> findRecentTasks();
    
    /**
     * 根据创建者查找任务
     */
    List<FileTask> findByCreatedBy(String createdBy);
    
    /**
     * 查找执行时间最长的任务
     */
    @Query("SELECT t FROM FileTask t WHERE t.executionTime IS NOT NULL ORDER BY t.executionTime DESC")
    List<FileTask> findLongestRunningTasks();
}
