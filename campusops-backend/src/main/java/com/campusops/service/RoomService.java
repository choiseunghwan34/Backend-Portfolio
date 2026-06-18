package com.campusops.service;

import com.campusops.dto.ReservationRequestDTO;
import com.campusops.dto.RoomRequestDTO;
import com.campusops.vo.RoomReservationVO;
import com.campusops.vo.RoomSeatVO;
import com.campusops.vo.RoomVO;

import java.util.List;

public interface RoomService {
    List<RoomVO> getRooms();
    RoomVO getRoom(Long roomNo);
    List<RoomSeatVO> getSeats(Long roomNo);
    List<RoomSeatVO> getSeatStatus(Long roomNo, String reservationDate, String startTime, String endTime);
    List<RoomReservationVO> getRoomReservations(Long roomNo);
    RoomVO createRoom(RoomRequestDTO request);
    RoomVO updateRoom(Long roomNo, RoomRequestDTO request);
    void disableRoom(Long roomNo);
    RoomReservationVO reserveRoom(Long roomNo, ReservationRequestDTO request);
    List<RoomReservationVO> getMyReservations();
    void cancelReservation(Long reservationNo);
    List<RoomReservationVO> getAllReservations();
}
