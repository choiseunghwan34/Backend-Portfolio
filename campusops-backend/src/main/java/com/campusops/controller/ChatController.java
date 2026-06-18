package com.campusops.controller;

import com.campusops.dto.ApiResponse;
import com.campusops.dto.ChatRequestDTO;
import com.campusops.dto.ChatResponseDTO;
import com.campusops.service.ChatService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @PostMapping
    public ApiResponse<ChatResponseDTO> ask(@Valid @RequestBody ChatRequestDTO request,
                                            HttpServletRequest servletRequest) {
        return ApiResponse.success("AI 답변 생성 성공", chatService.ask(request, servletRequest));
    }
}
