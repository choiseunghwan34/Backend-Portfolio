package com.campusops.service.impl;

import com.campusops.dao.RoomDao;
import com.campusops.dto.ReservationRequestDTO;
import com.campusops.dto.RoomRequestDTO;
import com.campusops.exception.BusinessException;
import com.campusops.service.NotificationService;
import com.campusops.service.RoomService;
import com.campusops.util.RedisKeys;
import com.campusops.util.SecurityUtil;
import com.campusops.vo.RoomReservationVO;
import com.campusops.vo.RoomVO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {
    private final RoomDao roomDao;
    private final RedisTemplate<String, Object> redisTemplate;
    private final NotificationService notificationService;

    @Override
    public List<RoomVO> getRooms() {
        return roomDao.selectRooms();
    }

    @Override
    public RoomVO getRoom(Long roomNo) {
        RoomVO room = roomDao.selectRoom(roomNo);
        if (room == null) {
            throw new BusinessException("공간을 찾을 수 없습니다.", 404);
        }
        return room;
    }

    @Override
    public List<RoomReservationVO> getRoomReservations(Long roomNo) {
        return roomDao.selectReservationsByRoom(roomNo);
    }

    @Override
    public RoomVO createRoom(RoomRequestDTO request) {
        RoomVO room = new RoomVO();
        room.setRoomName(request.getRoomName());
        room.setLocation(request.getLocation());
        room.setCapacity(request.getCapacity());
        room.setStatus("AVAILABLE");
        roomDao.insertRoom(room);
        return room;
    }

    @Override
    public RoomVO updateRoom(Long roomNo, RoomRequestDTO request) {
        RoomVO room = getRoom(roomNo);
        room.setRoomName(request.getRoomName());
        room.setLocation(request.getLocation());
        room.setCapacity(request.getCapacity());
        roomDao.updateRoom(room);
        return room;
    }

    @Override
    public void disableRoom(Long roomNo) {
        if (roomDao.disableRoom(roomNo) == 0) {
            throw new BusinessException("공간을 찾을 수 없습니다.", 404);
        }
    }

    @Override
    public RoomReservationVO reserveRoom(Long roomNo, ReservationRequestDTO request) {
        Long userNo = SecurityUtil.currentPrincipal().getUserNo();
        RoomVO room = getRoom(roomNo);
        if (!"AVAILABLE".equals(room.getStatus())) {
            throw new BusinessException("예약 가능한 공간이 아닙니다.");
        }
        String key = RedisKeys.reservationHold(roomNo, request.getReservationDate(), request.getStartTime());
        if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            throw new BusinessException("이미 예약이 진행 중인 시간입니다.", 429);
        }
        redisTemplate.opsForValue().set(key, "1", Duration.ofMinutes(5));

        LocalDate reservationDate = LocalDate.parse(request.getReservationDate());
        LocalTime startTime = LocalTime.parse(request.getStartTime());
        LocalTime endTime = LocalTime.parse(request.getEndTime());
        if (roomDao.existsReservation(roomNo, reservationDate, startTime, endTime) > 0) {
            throw new BusinessException("이미 예약된 시간입니다.");
        }

        RoomReservationVO reservation = new RoomReservationVO();
        reservation.setRoomNo(roomNo);
        reservation.setUserNo(userNo);
        reservation.setReservationDate(reservationDate);
        reservation.setStartTime(startTime);
        reservation.setEndTime(endTime);
        reservation.setStatus("RESERVED");
        roomDao.insertReservation(reservation);
        return reservation;
    }

    @Override
    public List<RoomReservationVO> getMyReservations() {
        return roomDao.selectMyReservations(SecurityUtil.currentPrincipal().getUserNo());
    }

    @Override
    public void cancelReservation(Long reservationNo) {
        RoomReservationVO reservation = roomDao.selectMyReservations(SecurityUtil.currentPrincipal().getUserNo())
                .stream()
                .filter(item -> reservationNo.equals(item.getReservationNo()))
                .findFirst()
                .orElseThrow(() -> new BusinessException("예약을 찾을 수 없습니다.", 404));
        roomDao.cancelReservation(reservationNo);
        notificationService.createNotification(reservation.getUserNo(), "예약 취소", "예약이 취소되었습니다.");
    }

    @Override
    public List<RoomReservationVO> getAllReservations() {
        return roomDao.selectAllReservations();
    }
}
