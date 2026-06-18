package com.campusops.controller;

import com.campusops.dto.ApiResponse;
import com.campusops.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {
    private final FileStorageService fileStorageService;

    @PostMapping("/{targetType}/{targetNo}")
    public ApiResponse<?> upload(@PathVariable String targetType,
                                 @PathVariable Long targetNo,
                                 @RequestParam("file") MultipartFile file) {
        return ApiResponse.success("파일 업로드 성공", fileStorageService.upload(targetType, targetNo, file));
    }

    @GetMapping("/{targetType}/{targetNo}")
    public ApiResponse<?> list(@PathVariable String targetType, @PathVariable Long targetNo) {
        return ApiResponse.success("첨부파일 조회 성공", fileStorageService.getAttachments(targetType, targetNo));
    }
}
