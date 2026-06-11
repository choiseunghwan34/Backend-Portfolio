package com.campusops.controller;

import com.campusops.dto.ApiResponse;
import com.campusops.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {
    private final RoomService roomService;

    @GetMapping("/my")
    public ApiResponse<?> myReservations() {
        return ApiResponse.success("내 예약 내역 조회 성공", roomService.getMyReservations());
    }

    @DeleteMapping("/{reservationNo}")
    public ApiResponse<?> cancel(@PathVariable Long reservationNo) {
        roomService.cancelReservation(reservationNo);
        return ApiResponse.success("예약 취소 성공", null);
    }
}
