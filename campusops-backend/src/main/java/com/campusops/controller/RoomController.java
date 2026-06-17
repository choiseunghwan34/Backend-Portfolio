package com.campusops.controller;

import com.campusops.dto.ApiResponse;
import com.campusops.dto.ReservationRequestDTO;
import com.campusops.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;

    @GetMapping
    public ApiResponse<?> list() {
        return ApiResponse.success("공간 목록 조회 성공", roomService.getRooms());
    }

    @GetMapping("/{roomNo}")
    public ApiResponse<?> detail(@PathVariable Long roomNo) {
        return ApiResponse.success("공간 상세 조회 성공", roomService.getRoom(roomNo));
    }

    @GetMapping("/{roomNo}/reservations")
    public ApiResponse<?> reservations(@PathVariable Long roomNo) {
        return ApiResponse.success("공간 예약 현황 조회 성공", roomService.getRoomReservations(roomNo));
    }

    @PostMapping("/{roomNo}/reservations")
    public ApiResponse<?> reserve(@PathVariable Long roomNo, @Valid @RequestBody ReservationRequestDTO request) {
        return ApiResponse.success("공간 예약 신청 성공", roomService.reserveRoom(roomNo, request));
    }
}
