package com.campusops.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class ChatRequestDTO {
    @NotBlank(message = "질문을 입력해 주세요.")
    private String message;
    private List<ChatMessageDTO> history;
}
