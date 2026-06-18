package com.campusops.service;

import com.campusops.vo.FileAttachmentVO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FileStorageService {
    FileAttachmentVO upload(String targetType, Long targetNo, MultipartFile file);
    List<FileAttachmentVO> getAttachments(String targetType, Long targetNo);
}
