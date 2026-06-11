package com.campusops.controller;

import com.campusops.dto.ApiResponse;
import com.campusops.dto.RoomRequestDTO;
import com.campusops.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/rooms")
@RequiredArgsConstructor
public class AdminRoomController {
    private final RoomService roomService;

    @PostMapping
    public ApiResponse<?> create(@Valid @RequestBody RoomRequestDTO request) {
        return ApiResponse.success("공간 등록 성공", roomService.createRoom(request));
    }

    @PutMapping("/{roomNo}")
    public ApiResponse<?> update(@PathVariable Long roomNo, @Valid @RequestBody RoomRequestDTO request) {
        return ApiResponse.success("공간 수정 성공", roomService.updateRoom(roomNo, request));
    }

    @PatchMapping("/{roomNo}/disable")
    public ApiResponse<?> disable(@PathVariable Long roomNo) {
        roomService.disableRoom(roomNo);
        return ApiResponse.success("공간 비활성화 성공", null);
    }

    @GetMapping("/reservations")
    public ApiResponse<?> reservations() {
        return ApiResponse.success("전체 예약 조회 성공", roomService.getAllReservations());
    }
}
