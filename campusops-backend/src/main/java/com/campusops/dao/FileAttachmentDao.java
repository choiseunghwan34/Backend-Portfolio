package com.campusops.dao;

import com.campusops.vo.FileAttachmentVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FileAttachmentDao {
    int insertAttachment(FileAttachmentVO attachment);
    List<FileAttachmentVO> selectByTarget(@Param("targetType") String targetType, @Param("targetNo") Long targetNo);
}
