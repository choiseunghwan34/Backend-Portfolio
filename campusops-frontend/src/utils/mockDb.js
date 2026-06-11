const STORAGE_KEY = 'campusops_mock_db';

const seed = () => ({
  users: [
    { userNo: 1, userId: 'admin', userPw: 'Admin123!', userName: '관리자', email: 'admin@campusops.local', role: 'ADMIN', createdAt: '2026-06-11T00:00:00' },
    { userNo: 2, userId: 'user01', userPw: 'User123!', userName: '일반사용자', email: 'user01@campusops.local', role: 'USER', createdAt: '2026-06-11T00:00:00' }
  ],
  notices: [
    { noticeNo: 1, title: '학사 일정 안내', content: '이번 주 학사 일정과 공지사항을 확인해 주세요.', category: '일반', importantYn: true, viewCount: 18, createdAt: '2026-06-11T00:00:00', updatedAt: '2026-06-11T00:00:00' },
    { noticeNo: 2, title: '시설 점검 안내', content: '금요일 오후 강의실 일부가 점검으로 일시 사용 제한됩니다.', category: '시설', importantYn: false, viewCount: 11, createdAt: '2026-06-11T00:00:00', updatedAt: '2026-06-11T00:00:00' },
    { noticeNo: 3, title: '대여 정책 변경', content: '기자재 대여 기간이 7일로 조정되었습니다.', category: '대여', importantYn: true, viewCount: 22, createdAt: '2026-06-11T00:00:00', updatedAt: '2026-06-11T00:00:00' }
  ],
  reports: [
    { reportNo: 1, userNo: 2, title: '강의실 조명 고장', content: '1층 강의실 조명이 깜빡입니다.', place: '1층 강의실', category: '조명', status: 'CHECKING', adminReply: '담당자 확인 중입니다.', createdAt: '2026-06-11T00:00:00', updatedAt: '2026-06-11T00:00:00' }
  ],
  assets: [
    { assetNo: 1, assetName: '노트북', category: 'IT', status: 'AVAILABLE', description: '프로젝트용 노트북', createdAt: '2026-06-11T00:00:00' },
    { assetNo: 2, assetName: '태블릿', category: 'IT', status: 'AVAILABLE', description: '자료 확인용 태블릿', createdAt: '2026-06-11T00:00:00' },
    { assetNo: 3, assetName: '카메라', category: '촬영', status: 'DISABLED', description: '촬영 장비', createdAt: '2026-06-11T00:00:00' },
    { assetNo: 4, assetName: '빔프로젝터', category: '발표', status: 'AVAILABLE', description: '발표용 프로젝터', createdAt: '2026-06-11T00:00:00' },
    { assetNo: 5, assetName: '마이크', category: '음향', status: 'AVAILABLE', description: '행사 음향용 마이크', createdAt: '2026-06-11T00:00:00' }
  ],
  rentals: [
    { rentalNo: 1, assetNo: 1, userNo: 2, rentalStatus: 'REQUESTED', rentalDate: '2026-06-11T09:00:00', returnDueDate: '2026-06-18T09:00:00', returnedAt: null, createdAt: '2026-06-11T09:00:00' }
  ],
  rooms: [
    { roomNo: 1, roomName: '강의실 A', location: '본관 2층', capacity: 30, status: 'AVAILABLE', createdAt: '2026-06-11T00:00:00' },
    { roomNo: 2, roomName: '회의실 B', location: '본관 3층', capacity: 12, status: 'AVAILABLE', createdAt: '2026-06-11T00:00:00' },
    { roomNo: 3, roomName: '스터디룸 C', location: '별관 1층', capacity: 8, status: 'AVAILABLE', createdAt: '2026-06-11T00:00:00' }
  ],
  reservations: [
    { reservationNo: 1, roomNo: 1, userNo: 2, reservationDate: '2026-06-12', startTime: '10:00', endTime: '12:00', status: 'RESERVED', createdAt: '2026-06-11T00:00:00' }
  ],
  notifications: [
    { notificationNo: 1, userNo: 2, title: '신고 접수 완료', content: '신고가 정상적으로 접수되었습니다.', readYn: false, createdAt: '2026-06-11T00:00:00' },
    { notificationNo: 2, userNo: 2, title: '대여 승인 안내', content: '노트북 대여 신청이 승인되었습니다.', readYn: true, createdAt: '2026-06-11T00:00:00' }
  ],
  counters: {
    userNo: 3,
    noticeNo: 4,
    reportNo: 2,
    assetNo: 6,
    rentalNo: 2,
    roomNo: 4,
    reservationNo: 2,
    notificationNo: 3
  }
});

export function loadMockDb() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const initial = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

export function saveMockDb(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  return db;
}

export function getCurrentMockUser() {
  const raw = localStorage.getItem('campusops_user');
  return raw ? JSON.parse(raw) : null;
}

export function setMockSession({ token, user }) {
  localStorage.setItem('campusops_token', token);
  localStorage.setItem('campusops_user', JSON.stringify(user));
}

export function clearMockSession() {
  localStorage.removeItem('campusops_token');
  localStorage.removeItem('campusops_user');
}
