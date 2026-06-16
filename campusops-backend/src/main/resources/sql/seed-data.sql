INSERT INTO users (user_id, user_pw, user_name, email, role)
VALUES
('admin', '$2a$10$/1REUTBio/I4QHA2Ol4NzeXcUihkt5/jgW6dOYntSCiWKru6aWLLS', '관리자', 'admin@campusops.local', 'ADMIN'),
('user01', '$2a$10$J8l3lgDvtVFwSA1jD3VwjOBS4RT8gLdu4Ea9fk5qOo3OZtjOJ2DdG', '김민지', 'user01@campusops.local', 'USER')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO notice (title, content, category, important_yn, view_count)
SELECT v.title, v.content, v.category, v.important_yn, v.view_count
FROM (
  VALUES
  ('2026학년도 2학기 강의실 운영 일정 안내', '2학기 강의실 운영 일정과 예약 가능 시간을 안내합니다. 강의실 예약은 운영 시간 내 신청할 수 있으며, 중복 신청은 자동으로 제한됩니다.', '공지', true, 128),
  ('기자재 대여 신청 가능 시간 변경 안내', '기자재 대여 신청 가능 시간이 평일 09:00부터 18:00까지로 변경됩니다. 수령과 반납은 행정실에서 진행됩니다.', '대여', false, 84),
  ('공간 예약 가능 구역 업데이트', '스터디룸 A, 회의실 B, 강의실 301의 예약 가능 시간이 업데이트되었습니다. 예약 전 공간별 수용 인원을 확인해 주세요.', '예약', false, 62),
  ('시설 신고 처리 절차 및 응답 기준 안내', '시설 고장 신고는 장소와 증상을 함께 입력해야 빠르게 처리됩니다. 처리 결과는 알림센터에서 확인할 수 있습니다.', '시설', false, 51),
  ('알림센터 읽음 처리 기능 안내', '신고 처리, 대여 승인, 예약 취소 등 주요 업무 결과는 알림센터로 전달됩니다.', '알림', false, 37)
) AS v(title, content, category, important_yn, view_count)
WHERE NOT EXISTS (
  SELECT 1 FROM notice n WHERE n.title = v.title
);

INSERT INTO asset (asset_name, category, status, description)
SELECT v.asset_name, v.category, v.status, v.description
FROM (
  VALUES
  ('노트북 Dell Latitude 5440', '노트북', 'AVAILABLE', '수업, 발표, 세미나 운영에 사용할 수 있는 업무용 노트북입니다. 기본 대여 기간은 7일입니다.'),
  ('태블릿 Galaxy Tab S9', '태블릿', 'AVAILABLE', '현장 출석 확인, 자료 열람, 간단한 발표 보조에 적합한 태블릿입니다.'),
  ('빔프로젝터 Epson X41', '프로젝터', 'AVAILABLE', '강의실과 회의실에서 사용할 수 있는 이동형 빔프로젝터입니다.'),
  ('무선 마이크 세트', '음향', 'RENTED', '행사, 세미나, 설명회 진행에 사용하는 무선 마이크 2개 세트입니다.'),
  ('Canon EOS R50 카메라', '카메라', 'DISABLED', '홍보 콘텐츠 촬영용 카메라입니다. 현재 점검으로 대여가 제한됩니다.')
) AS v(asset_name, category, status, description)
WHERE NOT EXISTS (
  SELECT 1 FROM asset a WHERE a.asset_name = v.asset_name
);

INSERT INTO room (room_name, location, capacity, status)
SELECT v.room_name, v.location, v.capacity, v.status
FROM (
  VALUES
  ('강의실 301', '본관 3층', 40, 'AVAILABLE'),
  ('스터디룸 A', '도서관 2층', 8, 'AVAILABLE'),
  ('회의실 B', '행정동 1층', 12, 'AVAILABLE'),
  ('세미나실 201', '창의관 2층', 32, 'AVAILABLE'),
  ('강의실 105', '본관 1층', 28, 'DISABLED')
) AS v(room_name, location, capacity, status)
WHERE NOT EXISTS (
  SELECT 1 FROM room r WHERE r.room_name = v.room_name
);

INSERT INTO facility_report (user_no, title, content, place, category, status, admin_reply)
SELECT u.user_no, v.title, v.content, v.place, v.category, v.status, v.admin_reply
FROM users u
CROSS JOIN (
  VALUES
  ('본관 3층 복도 조명 점검 요청', '복도 조명이 깜빡거려 야간 이동 시 불편합니다. 점검 부탁드립니다.', '본관 3층', '전기', 'RECEIVED', NULL),
  ('스터디룸 냉방기 작동 이상', '냉방기가 켜지지만 찬 바람이 나오지 않습니다. 이용 전 점검이 필요합니다.', '도서관 2층 스터디룸 A', '냉난방', 'CHECKING', '시설팀 확인 후 냉방기 필터와 실외기 상태를 점검할 예정입니다.'),
  ('강의동 1층 출입문 수리 요청', '출입문이 완전히 닫히지 않아 소음과 보안 문제가 우려됩니다.', '강의동 1층', '시설', 'COMPLETED', '도어 클로저 교체를 완료했습니다.')
) AS v(title, content, place, category, status, admin_reply)
WHERE u.user_id = 'user01'
  AND NOT EXISTS (
    SELECT 1 FROM facility_report fr
    WHERE fr.user_no = u.user_no
      AND fr.title = v.title
  );

INSERT INTO asset_rental (asset_no, user_no, rental_status, rental_date, return_due_date)
SELECT a.asset_no, u.user_no, v.rental_status, v.rental_date, v.return_due_date
FROM users u
JOIN (
  VALUES
  ('노트북 Dell Latitude 5440', 'REQUESTED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '7 days'),
  ('무선 마이크 세트', 'APPROVED', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '6 days')
) AS v(asset_name, rental_status, rental_date, return_due_date) ON true
JOIN asset a ON a.asset_name = v.asset_name
WHERE u.user_id = 'user01'
  AND NOT EXISTS (
    SELECT 1 FROM asset_rental ar
    WHERE ar.asset_no = a.asset_no
      AND ar.user_no = u.user_no
      AND ar.rental_status = v.rental_status
  );

INSERT INTO room_reservation (room_no, user_no, reservation_date, start_time, end_time, status)
SELECT r.room_no, u.user_no, v.reservation_date, v.start_time, v.end_time, 'RESERVED'
FROM users u
JOIN (
  VALUES
  ('강의실 301', CURRENT_DATE, TIME '10:00', TIME '11:00'),
  ('회의실 B', CURRENT_DATE, TIME '14:00', TIME '15:30'),
  ('스터디룸 A', CURRENT_DATE + 1, TIME '16:00', TIME '18:00')
) AS v(room_name, reservation_date, start_time, end_time) ON true
JOIN room r ON r.room_name = v.room_name
WHERE u.user_id = 'user01'
  AND NOT EXISTS (
    SELECT 1 FROM room_reservation rr
    WHERE rr.room_no = r.room_no
      AND rr.user_no = u.user_no
      AND rr.reservation_date = v.reservation_date
      AND rr.start_time = v.start_time
      AND rr.end_time = v.end_time
  );

INSERT INTO notification (user_no, title, content, read_yn)
SELECT u.user_no, v.title, v.content, v.read_yn
FROM users u
CROSS JOIN (
  VALUES
  ('시설 신고가 접수되었습니다', '본관 3층 복도 조명 점검 요청이 접수되었습니다.', false),
  ('기자재 대여 신청 안내', '노트북 대여 신청이 접수되었으며 관리자 승인을 기다리고 있습니다.', false),
  ('공간 예약이 확정되었습니다', '강의실 301 예약이 오늘 10:00 - 11:00로 확정되었습니다.', true)
) AS v(title, content, read_yn)
WHERE u.user_id = 'user01'
  AND NOT EXISTS (
    SELECT 1 FROM notification n
    WHERE n.user_no = u.user_no
      AND n.title = v.title
  );
