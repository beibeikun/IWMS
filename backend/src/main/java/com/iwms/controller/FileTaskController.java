package com.iwms.controller;

import com.iwms.entity.FileTask;
import com.iwms.service.FileTaskService;
import com.iwms.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 文件任务管理控制器
 */
@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "*")
public class FileTaskController {

    @Autowired
    private FileTaskService fileTaskService;

    /**
     * 创建文件重命名任务
     */
    @PostMapping("/rename")
    public ResponseEntity<ApiResponse<FileTask>> createRenameTask(
            @RequestParam("sourcePath") String sourcePath,
            @RequestParam("targetPath") String targetPath,
            @RequestParam(value = "mappingFile", required = false) MultipartFile mappingFile,
            @RequestParam(value = "taskName", required = false) String taskName,
            @RequestParam(value = "description", required = false) String description) {
        
        try {
            FileTask task = fileTaskService.createRenameTask(sourcePath, targetPath, mappingFile, taskName, description);
            return ResponseEntity.ok(ApiResponse.success(task, "任务创建成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("任务创建失败: " + e.getMessage()));
        }
    }

    /**
     * 创建图片压缩任务
     */
    @PostMapping("/compress")
    public ResponseEntity<ApiResponse<FileTask>> createCompressTask(
            @RequestParam("sourcePath") String sourcePath,
            @RequestParam("targetPath") String targetPath,
            @RequestParam(value = "maxWidth", defaultValue = "1920") Integer maxWidth,
            @RequestParam(value = "maxHeight", defaultValue = "1080") Integer maxHeight,
            @RequestParam(value = "quality", defaultValue = "0.8") Double quality,
            @RequestParam(value = "taskName", required = false) String taskName,
            @RequestParam(value = "description", required = false) String description) {
        
        try {
            FileTask task = fileTaskService.createCompressTask(sourcePath, targetPath, maxWidth, maxHeight, quality, taskName, description);
            return ResponseEntity.ok(ApiResponse.success(task, "压缩任务创建成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("压缩任务创建失败: " + e.getMessage()));
        }
    }

    /**
     * 获取所有任务列表
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<FileTask>>> getAllTasks(Pageable pageable) {
        try {
            Page<FileTask> tasks = fileTaskService.getAllTasks(pageable);
            return ResponseEntity.ok(ApiResponse.success(tasks, "获取任务列表成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("获取任务列表失败: " + e.getMessage()));
        }
    }

    /**
     * 根据ID获取任务详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FileTask>> getTaskById(@PathVariable Long id) {
        try {
            FileTask task = fileTaskService.getTaskById(id);
            return ResponseEntity.ok(ApiResponse.success(task, "获取任务详情成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("获取任务详情失败: " + e.getMessage()));
        }
    }

    /**
     * 启动任务
     */
    @PostMapping("/{id}/start")
    public ResponseEntity<ApiResponse<String>> startTask(@PathVariable Long id) {
        try {
            fileTaskService.startTask(id);
            return ResponseEntity.ok(ApiResponse.success("任务启动成功", "任务已开始执行"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("任务启动失败: " + e.getMessage()));
        }
    }

    /**
     * 取消任务
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<String>> cancelTask(@PathVariable Long id) {
        try {
            fileTaskService.cancelTask(id);
            return ResponseEntity.ok(ApiResponse.success("任务取消成功", "任务已取消"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("任务取消失败: " + e.getMessage()));
        }
    }

    /**
     * 删除任务
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteTask(@PathVariable Long id) {
        try {
            fileTaskService.deleteTask(id);
            return ResponseEntity.ok(ApiResponse.success("任务删除成功", "任务已删除"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("任务删除失败: " + e.getMessage()));
        }
    }

    /**
     * 获取任务统计信息
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Object>> getTaskStats() {
        try {
            Object stats = fileTaskService.getTaskStats();
            return ResponseEntity.ok(ApiResponse.success(stats, "获取统计信息成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("获取统计信息失败: " + e.getMessage()));
        }
    }

    /**
     * 获取任务进度
     */
    @GetMapping("/{id}/progress")
    public ResponseEntity<ApiResponse<Object>> getTaskProgress(@PathVariable Long id) {
        try {
            Object progress = fileTaskService.getTaskProgress(id);
            return ResponseEntity.ok(ApiResponse.success(progress, "获取任务进度成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("获取任务进度失败: " + e.getMessage()));
        }
    }

    /**
     * 下载任务报告
     */
    @GetMapping("/{id}/report")
    public ResponseEntity<ApiResponse<String>> downloadReport(@PathVariable Long id) {
        try {
            String reportPath = fileTaskService.getReportPath(id);
            return ResponseEntity.ok(ApiResponse.success(reportPath, "报告路径获取成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("获取报告失败: " + e.getMessage()));
        }
    }
}
