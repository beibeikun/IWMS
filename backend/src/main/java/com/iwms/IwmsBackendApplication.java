package com.iwms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * IWMS后端服务主启动类
 * 
 * @author IWMS Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class IwmsBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(IwmsBackendApplication.class, args);
        System.out.println("🚀 IWMS后端服务启动成功!");
        System.out.println("📊 健康检查: http://localhost:8080/api/actuator/health");
        System.out.println("🗄️  H2数据库: http://localhost:8080/api/h2-console");
        System.out.println("📚 API文档: http://localhost:8080/api/swagger-ui.html");
    }
}
