package com.campusops.service;

import com.campusops.dto.ChatRequestDTO;
import com.campusops.dto.ChatResponseDTO;

import jakarta.servlet.http.HttpServletRequest;

public interface ChatService {
    ChatResponseDTO ask(ChatRequestDTO request, HttpServletRequest servletRequest);
}
