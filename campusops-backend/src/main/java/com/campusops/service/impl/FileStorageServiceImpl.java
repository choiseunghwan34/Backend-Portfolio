package com.campusops.service.impl;

import com.campusops.dao.FileAttachmentDao;
import com.campusops.exception.BusinessException;
import com.campusops.service.FileStorageService;
import com.campusops.vo.FileAttachmentVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageServiceImpl implements FileStorageService {
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final Set<String> ALLOWED_TARGETS = Set.of("NOTICE", "REPORT", "ASSET", "ROOM", "USER");

    private final FileAttachmentDao fileAttachmentDao;

    @Value("${supabase.project-url:}")
    private String projectUrl;

    @Value("${supabase.service-role-key:}")
    private String serviceRoleKey;

    @Value("${supabase.storage-bucket:campusops-files}")
    private String bucket;

    @Override
    public FileAttachmentVO upload(String targetType, Long targetNo, MultipartFile file) {
        String normalizedTarget = normalizeTarget(targetType);
        validate(file);
        ensureStorageConfigured();

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "upload" : file.getOriginalFilename());
        String extension = extractExtension(originalName);
        String filePath = normalizedTarget.toLowerCase(Locale.ROOT) + "/" + targetNo + "/" + UUID.randomUUID() + extension;
        String uploadPath = "/storage/v1/object/" + encodePath(bucket) + "/" + encodeObjectPath(filePath);

        try {
            RestClient.builder()
                    .baseUrl(projectUrl)
                    .defaultHeader("Authorization", "Bearer " + serviceRoleKey)
                    .defaultHeader("apikey", serviceRoleKey)
                    .defaultHeader("x-upsert", "true")
                    .build()
                    .post()
                    .uri(uploadPath)
                    .contentType(MediaType.parseMediaType(file.getContentType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : file.getContentType()))
                    .body(file.getBytes())
                    .retrieve()
                    .toBodilessEntity();
        } catch (IOException exception) {
            throw new BusinessException("파일을 읽는 중 오류가 발생했습니다.");
        } catch (Exception exception) {
            throw new BusinessException("Supabase Storage 업로드에 실패했습니다. Storage 환경변수와 버킷 설정을 확인해 주세요.");
        }

        FileAttachmentVO attachment = new FileAttachmentVO();
        attachment.setTargetType(normalizedTarget);
        attachment.setTargetNo(targetNo);
        attachment.setOriginalName(originalName);
        attachment.setFilePath(filePath);
        attachment.setFileUrl(publicUrl(filePath));
        attachment.setContentType(file.getContentType());
        attachment.setFileSize(file.getSize());
        fileAttachmentDao.insertAttachment(attachment);
        return attachment;
    }

    @Override
    public List<FileAttachmentVO> getAttachments(String targetType, Long targetNo) {
        return fileAttachmentDao.selectByTarget(normalizeTarget(targetType), targetNo);
    }

    private String normalizeTarget(String targetType) {
        String normalized = String.valueOf(targetType).trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_TARGETS.contains(normalized)) {
            throw new BusinessException("지원하지 않는 첨부 대상입니다.");
        }
        return normalized;
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("업로드할 파일을 선택해 주세요.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException("파일은 10MB 이하만 업로드할 수 있습니다.");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType();
        if (!(contentType.startsWith("image/") || MediaType.APPLICATION_PDF_VALUE.equals(contentType))) {
            throw new BusinessException("이미지 또는 PDF 파일만 업로드할 수 있습니다.");
        }
    }

    private void ensureStorageConfigured() {
        if (!StringUtils.hasText(projectUrl) || !StringUtils.hasText(serviceRoleKey) || !StringUtils.hasText(bucket)) {
            throw new BusinessException("Supabase Storage 환경변수가 설정되지 않았습니다.");
        }
    }

    private String extractExtension(String originalName) {
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == originalName.length() - 1) {
            return "";
        }
        return originalName.substring(dotIndex).toLowerCase(Locale.ROOT);
    }

    private String publicUrl(String filePath) {
        return projectUrl + "/storage/v1/object/public/" + encodePath(bucket) + "/" + encodeObjectPath(filePath);
    }

    private String encodePath(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private String encodeObjectPath(String path) {
        return String.join("/", List.of(path.split("/")).stream().map(this::encodePath).toList());
    }
}
