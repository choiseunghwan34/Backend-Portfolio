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
import com.campusops.vo.RoomSeatVO;
import com.campusops.vo.RoomVO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {
    private static final int DEFAULT_SEATS_PER_ROW = 10;
    private static final int SEMINAR_SEATS_PER_ROW = 8;
    private static final int MEETING_SEATS_PER_ROW = 6;
    private static final int STUDY_SEATS_PER_ROW = 4;

    private final RoomDao roomDao;
    private final RedisTemplate<String, Object> redisTemplate;
    private final NotificationService notificationService;

    @Override
    public List<RoomVO> getRooms() {
        roomDao.completeExpiredReservations();
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
    public List<RoomSeatVO> getSeats(Long roomNo) {
        getRoom(roomNo);
        return roomDao.selectSeats(roomNo);
    }

    @Override
    public List<RoomSeatVO> getSeatStatus(Long roomNo, String reservationDate, String startTime, String endTime) {
        getRoom(roomNo);
        LocalDate date = LocalDate.parse(reservationDate);
        LocalTime start = LocalTime.parse(startTime);
        LocalTime end = LocalTime.parse(endTime);
        if (!start.isBefore(end)) {
            throw new BusinessException("종료 시간은 시작 시간보다 늦어야 합니다.");
        }
        return roomDao.selectSeatStatus(roomNo, date, start, end);
    }

    @Override
    public List<RoomReservationVO> getRoomReservations(Long roomNo) {
        roomDao.completeExpiredReservations();
        return roomDao.selectReservationsByRoom(roomNo);
    }

    @Override
    @Transactional
    public RoomVO createRoom(RoomRequestDTO request) {
        RoomVO room = new RoomVO();
        room.setRoomName(request.getRoomName());
        room.setLocation(request.getLocation());
        room.setCapacity(normalizeCapacity(request.getCapacity()));
        room.setStatus("AVAILABLE");
        roomDao.insertRoom(room);
        refreshSeatLayout(room);
        return getRoom(room.getRoomNo());
    }

    @Override
    @Transactional
    public RoomVO updateRoom(Long roomNo, RoomRequestDTO request) {
        RoomVO room = getRoom(roomNo);
        room.setRoomName(request.getRoomName());
        room.setLocation(request.getLocation());
        room.setCapacity(normalizeCapacity(request.getCapacity()));
        roomDao.updateRoom(room);
        refreshSeatLayout(room);
        return getRoom(roomNo);
    }

    @Override
    public void disableRoom(Long roomNo) {
        if (roomDao.disableRoom(roomNo) == 0) {
            throw new BusinessException("공간을 찾을 수 없습니다.", 404);
        }
    }

    @Override
    public RoomReservationVO reserveRoom(Long roomNo, ReservationRequestDTO request) {
        roomDao.completeExpiredReservations();
        Long userNo = SecurityUtil.currentPrincipal().getUserNo();
        RoomVO room = getRoom(roomNo);
        if (!"AVAILABLE".equals(room.getStatus())) {
            throw new BusinessException("운영 중지된 공간은 예약할 수 없습니다.");
        }

        LocalDate reservationDate = LocalDate.parse(request.getReservationDate());
        LocalTime startTime = LocalTime.parse(request.getStartTime());
        LocalTime endTime = LocalTime.parse(request.getEndTime());
        validateReservationTime(reservationDate, startTime, endTime);

        RoomSeatVO selectedSeat = resolveSeat(roomNo, request.getSeatNo());
        String holdKey = selectedSeat == null
                ? RedisKeys.reservationHold(roomNo, request.getReservationDate(), request.getStartTime())
                : RedisKeys.reservationSeatHold(roomNo, request.getReservationDate(), request.getStartTime(), selectedSeat.getSeatNo());
        if (Boolean.TRUE.equals(redisTemplate.hasKey(holdKey))) {
            throw new BusinessException("이미 예약 요청이 진행 중인 좌석 또는 시간입니다.", 429);
        }
        redisTemplate.opsForValue().set(holdKey, "1", Duration.ofMinutes(5));

        Long seatNo = selectedSeat == null ? null : selectedSeat.getSeatNo();
        if (roomDao.existsReservation(roomNo, seatNo, reservationDate, startTime, endTime) > 0) {
            throw new BusinessException("이미 예약된 좌석 또는 시간입니다.");
        }

        RoomReservationVO reservation = new RoomReservationVO();
        reservation.setRoomNo(roomNo);
        reservation.setSeatNo(seatNo);
        if (selectedSeat != null) {
            reservation.setSeatCode(selectedSeat.getSeatCode());
            reservation.setRowLabel(selectedSeat.getRowLabel());
            reservation.setColNo(selectedSeat.getColNo());
        }
        reservation.setRoomName(room.getRoomName());
        reservation.setLocation(room.getLocation());
        reservation.setUserNo(userNo);
        reservation.setReservationDate(reservationDate);
        reservation.setStartTime(startTime);
        reservation.setEndTime(endTime);
        reservation.setStatus("RESERVED");
        roomDao.insertReservation(reservation);

        String seatLabel = selectedSeat == null ? "" : " " + selectedSeat.getSeatCode() + " 좌석";
        notificationService.createNotification(userNo, "공간 예약 완료", room.getRoomName() + seatLabel + " 예약이 확정되었습니다.");
        return reservation;
    }

    @Override
    public List<RoomReservationVO> getMyReservations() {
        roomDao.completeExpiredReservations();
        return roomDao.selectMyReservations(SecurityUtil.currentPrincipal().getUserNo());
    }

    @Override
    public void cancelReservation(Long reservationNo) {
        roomDao.completeExpiredReservations();
        RoomReservationVO reservation = roomDao.selectMyReservations(SecurityUtil.currentPrincipal().getUserNo())
                .stream()
                .filter(item -> reservationNo.equals(item.getReservationNo()))
                .findFirst()
                .orElseThrow(() -> new BusinessException("예약을 찾을 수 없습니다.", 404));
        if (!"RESERVED".equals(reservation.getStatus())) {
            throw new BusinessException("예약 중인 건만 취소할 수 있습니다.");
        }
        if (roomDao.cancelReservation(reservationNo) == 0) {
            throw new BusinessException("예약을 취소할 수 없습니다.");
        }
        notificationService.createNotification(reservation.getUserNo(), "예약 취소", reservation.getRoomName() + " 예약이 취소되었습니다.");
    }

    @Override
    public List<RoomReservationVO> getAllReservations() {
        roomDao.completeExpiredReservations();
        return roomDao.selectAllReservations();
    }

    private void validateReservationTime(LocalDate reservationDate, LocalTime startTime, LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new BusinessException("종료 시간은 시작 시간보다 늦어야 합니다.");
        }
        if (reservationDate.isBefore(LocalDate.now())
                || (reservationDate.isEqual(LocalDate.now()) && !startTime.isAfter(LocalTime.now()))) {
            throw new BusinessException("지난 시간은 예약할 수 없습니다.");
        }
    }

    private RoomSeatVO resolveSeat(Long roomNo, Long seatNo) {
        List<RoomSeatVO> seats = roomDao.selectSeats(roomNo);
        if (seats.isEmpty()) {
            return null;
        }
        if (seatNo == null) {
            throw new BusinessException("좌석을 선택해 주세요.");
        }
        RoomSeatVO seat = roomDao.selectSeat(seatNo);
        if (seat == null || !roomNo.equals(seat.getRoomNo())) {
            throw new BusinessException("선택한 좌석을 찾을 수 없습니다.", 404);
        }
        if (!"AVAILABLE".equals(seat.getStatus())) {
            throw new BusinessException("사용할 수 없는 좌석입니다.");
        }
        return seat;
    }

    private void refreshSeatLayout(RoomVO room) {
        if (room.getRoomNo() == null || room.getCapacity() == null || room.getCapacity() <= 0) {
            return;
        }
        roomDao.deleteUnusedSeatsByRoom(room.getRoomNo());
        roomDao.generateSeats(room.getRoomNo(), room.getCapacity(), seatsPerRow(room.getRoomName()));
    }

    private Integer normalizeCapacity(Integer capacity) {
        if (capacity == null || capacity < 1) {
            return 1;
        }
        return capacity;
    }

    private Integer seatsPerRow(String roomName) {
        String name = roomName == null ? "" : roomName;
        if (name.contains("스터디룸")) {
            return STUDY_SEATS_PER_ROW;
        }
        if (name.contains("회의실")) {
            return MEETING_SEATS_PER_ROW;
        }
        if (name.contains("세미나")) {
            return SEMINAR_SEATS_PER_ROW;
        }
        return DEFAULT_SEATS_PER_ROW;
    }
}
