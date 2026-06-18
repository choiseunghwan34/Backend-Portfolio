package com.campusops.dao;

import com.campusops.vo.RoomReservationVO;
import com.campusops.vo.RoomSeatVO;
import com.campusops.vo.RoomVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
@Mapper
public interface RoomDao {
    List<RoomVO> selectRooms();
    RoomVO selectRoom(@Param("roomNo") Long roomNo);
    int insertRoom(RoomVO roomVO);
    int updateRoom(RoomVO roomVO);
    int disableRoom(@Param("roomNo") Long roomNo);
    int deleteUnusedSeatsByRoom(@Param("roomNo") Long roomNo);
    int generateSeats(@Param("roomNo") Long roomNo,
                      @Param("capacity") Integer capacity,
                      @Param("seatsPerRow") Integer seatsPerRow);
    List<RoomSeatVO> selectSeats(@Param("roomNo") Long roomNo);
    RoomSeatVO selectSeat(@Param("seatNo") Long seatNo);
    List<RoomSeatVO> selectSeatStatus(@Param("roomNo") Long roomNo,
                                      @Param("reservationDate") java.time.LocalDate reservationDate,
                                      @Param("startTime") java.time.LocalTime startTime,
                                      @Param("endTime") java.time.LocalTime endTime);
    List<RoomReservationVO> selectReservationsByRoom(@Param("roomNo") Long roomNo);
    List<RoomReservationVO> selectMyReservations(@Param("userNo") Long userNo);
    List<RoomReservationVO> selectAllReservations();
    int insertReservation(RoomReservationVO reservationVO);
    int cancelReservation(@Param("reservationNo") Long reservationNo);
    int completeExpiredReservations();
    int countTodayReservations();
    int existsReservation(@Param("roomNo") Long roomNo,
                          @Param("seatNo") Long seatNo,
                          @Param("reservationDate") java.time.LocalDate reservationDate,
                          @Param("startTime") java.time.LocalTime startTime,
                          @Param("endTime") java.time.LocalTime endTime);
}
