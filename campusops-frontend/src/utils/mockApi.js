import { clearMockSession, getCurrentMockUser, loadMockDb, saveMockDb, setMockSession } from './mockDb';

function response(data, message = '요청이 성공했습니다.') {
  return Promise.resolve({ data: { success: true, message, data } });
}

function fail(message, status = 400) {
  return Promise.reject({ response: { status, data: { success: false, message, data: null } } });
}

function nextId(db, key) {
  const value = db.counters[key];
  db.counters[key] += 1;
  return value;
}

function currentUser(db) {
  const session = getCurrentMockUser();
  if (!session) return null;
  return db.users.find((user) => user.userNo === session.userNo) || null;
}

function ensureUser(db) {
  const user = currentUser(db);
  if (!user) throw fail('인증이 필요합니다.', 401);
  return user;
}

function parseId(url) {
  const match = url.match(/\/(\d+)(?:\/|$)/);
  return match ? Number(match[1]) : null;
}

function paginate(items, params) {
  const page = Number(params?.page || 1);
  const size = Number(params?.size || 10);
  const start = (page - 1) * size;
  return { items: items.slice(start, start + size), total: items.length, page, size };
}

function createNotification(db, userNo, title, content) {
  db.notifications.unshift({
    notificationNo: nextId(db, 'notificationNo'),
    userNo,
    title,
    content,
    readYn: false,
    createdAt: new Date().toISOString()
  });
}

function handleAuth(db, method, url, payload) {
  if (method === 'post' && url.endsWith('/api/auth/login')) {
    const user = db.users.find((item) => item.userId === payload.userId && item.userPw === payload.userPw);
    if (!user) return fail('아이디 또는 비밀번호가 올바르지 않습니다.', 401);
    const token = `mock-token-${user.userId}`;
    setMockSession({ token, user: { userNo: user.userNo, userId: user.userId, userName: user.userName, role: user.role } });
    return response({ token, userNo: user.userNo, userId: user.userId, userName: user.userName, role: user.role }, '로그인이 완료되었습니다.');
  }
  if (method === 'post' && url.endsWith('/api/auth/signup')) {
    if (db.users.some((item) => item.userId === payload.userId)) return fail('이미 존재하는 아이디입니다.');
    if (db.users.some((item) => item.email === payload.email)) return fail('이미 존재하는 이메일입니다.');
    const user = {
      userNo: nextId(db, 'userNo'),
      userId: payload.userId,
      userPw: payload.userPw,
      userName: payload.userName,
      email: payload.email,
      role: 'USER',
      createdAt: new Date().toISOString()
    };
    db.users.unshift(user);
    saveMockDb(db);
    const token = `mock-token-${user.userId}`;
    setMockSession({ token, user: { userNo: user.userNo, userId: user.userId, userName: user.userName, role: user.role } });
    return response({ token, userNo: user.userNo, userId: user.userId, userName: user.userName, role: user.role }, '회원가입이 완료되었습니다.');
  }
  if (method === 'post' && url.endsWith('/api/auth/logout')) {
    clearMockSession();
    return response(null, '로그아웃이 완료되었습니다.');
  }
  if (method === 'get' && url.endsWith('/api/users/me')) {
    const user = ensureUser(db);
    return response(user, '내 정보 조회 성공');
  }
  return null;
}

function handleNotices(db, method, url, payload, params) {
  if (method === 'get' && url.endsWith('/api/notices/recent')) {
    return response(db.notices.slice(0, 5), '최근 공지 조회 성공');
  }
  if (method === 'get' && url.match(/\/api\/notices\/\d+$/)) {
    const noticeNo = parseId(url);
    const notice = db.notices.find((item) => item.noticeNo === noticeNo);
    if (!notice) return fail('공지사항을 찾을 수 없습니다.', 404);
    notice.viewCount += 1;
    notice.updatedAt = new Date().toISOString();
    saveMockDb(db);
    return response(notice, '공지사항 상세 조회 성공');
  }
  if (method === 'get' && url.endsWith('/api/notices')) {
    const keyword = (params?.keyword || '').trim().toLowerCase();
    const list = db.notices
      .filter((item) => !keyword || [item.title, item.content, item.category].some((field) => String(field || '').toLowerCase().includes(keyword)))
      .sort((a, b) => (b.importantYn === a.importantYn ? b.noticeNo - a.noticeNo : Number(b.importantYn) - Number(a.importantYn)));
    return response(paginate(list, params), '공지사항 조회 성공');
  }
  if (method === 'post' && url.endsWith('/api/admin/notices')) {
    ensureUser(db);
    const notice = {
      noticeNo: nextId(db, 'noticeNo'),
      title: payload.title,
      content: payload.content,
      category: payload.category || '',
      importantYn: Boolean(payload.importantYn),
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.notices.unshift(notice);
    saveMockDb(db);
    return response(notice, '공지 등록 성공');
  }
  if (method === 'put' && url.match(/\/api\/admin\/notices\/\d+$/)) {
    ensureUser(db);
    const noticeNo = parseId(url);
    const notice = db.notices.find((item) => item.noticeNo === noticeNo);
    if (!notice) return fail('공지사항을 찾을 수 없습니다.', 404);
    Object.assign(notice, {
      title: payload.title,
      content: payload.content,
      category: payload.category || '',
      importantYn: Boolean(payload.importantYn),
      updatedAt: new Date().toISOString()
    });
    saveMockDb(db);
    return response(notice, '공지 수정 성공');
  }
  if (method === 'delete' && url.match(/\/api\/admin\/notices\/\d+$/)) {
    ensureUser(db);
    const noticeNo = parseId(url);
    db.notices = db.notices.filter((item) => item.noticeNo !== noticeNo);
    saveMockDb(db);
    return response(null, '공지 삭제 성공');
  }
  return null;
}

function handleReports(db, method, url, payload) {
  const user = currentUser(db);
  if (method === 'post' && url.endsWith('/api/reports')) {
    if (!user) return fail('인증이 필요합니다.', 401);
    const report = {
      reportNo: nextId(db, 'reportNo'),
      userNo: user.userNo,
      title: payload.title,
      content: payload.content,
      place: payload.place,
      category: payload.category || '',
      status: 'RECEIVED',
      adminReply: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.reports.unshift(report);
    createNotification(db, user.userNo, '신고 접수 완료', '신고가 정상적으로 접수되었습니다.');
    saveMockDb(db);
    return response(report, '시설 신고 등록 성공');
  }
  if (method === 'get' && url.endsWith('/api/reports/my')) {
    if (!user) return fail('인증이 필요합니다.', 401);
    return response(db.reports.filter((item) => item.userNo === user.userNo), '내 신고 목록 조회 성공');
  }
  if (method === 'get' && url.match(/\/api\/reports\/\d+$/)) {
    const reportNo = parseId(url);
    const report = db.reports.find((item) => item.reportNo === reportNo);
    if (!report) return fail('신고를 찾을 수 없습니다.', 404);
    return response(report, '신고 상세 조회 성공');
  }
  if (method === 'get' && url.endsWith('/api/admin/reports')) {
    ensureUser(db);
    return response(db.reports, '전체 신고 목록 조회 성공');
  }
  if (method === 'patch' && url.match(/\/api\/admin\/reports\/\d+\/status$/)) {
    ensureUser(db);
    const reportNo = parseId(url);
    const report = db.reports.find((item) => item.reportNo === reportNo);
    if (!report) return fail('신고를 찾을 수 없습니다.', 404);
    report.status = payload.status;
    report.updatedAt = new Date().toISOString();
    createNotification(db, report.userNo, '신고 처리 결과', `신고 번호 ${reportNo} 상태가 ${payload.status}로 변경되었습니다.`);
    saveMockDb(db);
    return response(null, '신고 상태 변경 성공');
  }
  if (method === 'patch' && url.match(/\/api\/admin\/reports\/\d+\/reply$/)) {
    ensureUser(db);
    const reportNo = parseId(url);
    const report = db.reports.find((item) => item.reportNo === reportNo);
    if (!report) return fail('신고를 찾을 수 없습니다.', 404);
    report.adminReply = payload.adminReply;
    report.updatedAt = new Date().toISOString();
    createNotification(db, report.userNo, '관리자 답변', payload.adminReply);
    saveMockDb(db);
    return response(null, '신고 답변 등록 성공');
  }
  return null;
}

function handleAssets(db, method, url, payload) {
  const user = currentUser(db);
  if (method === 'get' && url.endsWith('/api/assets')) {
    return response(db.assets, '기자재 목록 조회 성공');
  }
  if (method === 'get' && url.match(/\/api\/assets\/\d+$/)) {
    const assetNo = parseId(url);
    const asset = db.assets.find((item) => item.assetNo === assetNo);
    if (!asset) return fail('기자재를 찾을 수 없습니다.', 404);
    return response(asset, '기자재 상세 조회 성공');
  }
  if (method === 'post' && url.match(/\/api\/assets\/\d+\/rentals$/)) {
    if (!user) return fail('인증이 필요합니다.', 401);
    const assetNo = parseId(url);
    const asset = db.assets.find((item) => item.assetNo === assetNo);
    if (!asset || asset.status !== 'AVAILABLE') return fail('대여 가능한 기자재가 아닙니다.');
    const rental = {
      rentalNo: nextId(db, 'rentalNo'),
      assetNo,
      userNo: user.userNo,
      rentalStatus: 'REQUESTED',
      rentalDate: new Date().toISOString(),
      returnDueDate: new Date(Date.now() + Number(payload.rentalDays || 7) * 86400000).toISOString(),
      returnedAt: null,
      createdAt: new Date().toISOString()
    };
    db.rentals.unshift(rental);
    saveMockDb(db);
    return response(rental, '기자재 대여 신청 성공');
  }
  if (method === 'get' && url.endsWith('/api/rentals/my')) {
    if (!user) return fail('인증이 필요합니다.', 401);
    return response(db.rentals.filter((item) => item.userNo === user.userNo), '내 대여 내역 조회 성공');
  }
  if (method === 'post' && url.endsWith('/api/admin/assets')) {
    ensureUser(db);
    const asset = {
      assetNo: nextId(db, 'assetNo'),
      assetName: payload.assetName,
      category: payload.category || '',
      status: 'AVAILABLE',
      description: payload.description || '',
      createdAt: new Date().toISOString()
    };
    db.assets.unshift(asset);
    saveMockDb(db);
    return response(asset, '기자재 등록 성공');
  }
  if (method === 'put' && url.match(/\/api\/admin\/assets\/\d+$/)) {
    ensureUser(db);
    const assetNo = parseId(url);
    const asset = db.assets.find((item) => item.assetNo === assetNo);
    if (!asset) return fail('기자재를 찾을 수 없습니다.', 404);
    Object.assign(asset, { assetName: payload.assetName, category: payload.category || '', description: payload.description || '' });
    saveMockDb(db);
    return response(asset, '기자재 수정 성공');
  }
  if (method === 'patch' && url.match(/\/api\/admin\/assets\/\d+\/disable$/)) {
    ensureUser(db);
    const assetNo = parseId(url);
    const asset = db.assets.find((item) => item.assetNo === assetNo);
    if (!asset) return fail('기자재를 찾을 수 없습니다.', 404);
    asset.status = 'DISABLED';
    saveMockDb(db);
    return response(null, '기자재 비활성화 성공');
  }
  if (method === 'get' && url.endsWith('/api/admin/assets/rentals')) {
    ensureUser(db);
    return response(db.rentals, '대여 목록 조회 성공');
  }
  if (method === 'patch' && url.match(/\/api\/admin\/assets\/rentals\/\d+\/approve$/)) {
    ensureUser(db);
    const rentalNo = parseId(url);
    const rental = db.rentals.find((item) => item.rentalNo === rentalNo);
    if (!rental) return fail('대여 신청을 찾을 수 없습니다.', 404);
    rental.rentalStatus = 'APPROVED';
    const asset = db.assets.find((item) => item.assetNo === rental.assetNo);
    if (asset) asset.status = 'RENTED';
    createNotification(db, rental.userNo, '대여 승인', '대여 신청이 승인되었습니다.');
    saveMockDb(db);
    return response(null, '대여 승인 성공');
  }
  if (method === 'patch' && url.match(/\/api\/admin\/assets\/rentals\/\d+\/reject$/)) {
    ensureUser(db);
    const rentalNo = parseId(url);
    const rental = db.rentals.find((item) => item.rentalNo === rentalNo);
    if (!rental) return fail('대여 신청을 찾을 수 없습니다.', 404);
    rental.rentalStatus = 'REJECTED';
    createNotification(db, rental.userNo, '대여 반려', '대여 신청이 반려되었습니다.');
    saveMockDb(db);
    return response(null, '대여 반려 성공');
  }
  if (method === 'patch' && url.match(/\/api\/admin\/assets\/rentals\/\d+\/return$/)) {
    ensureUser(db);
    const rentalNo = parseId(url);
    const rental = db.rentals.find((item) => item.rentalNo === rentalNo);
    if (!rental) return fail('대여 신청을 찾을 수 없습니다.', 404);
    rental.rentalStatus = 'RETURNED';
    rental.returnedAt = new Date().toISOString();
    const asset = db.assets.find((item) => item.assetNo === rental.assetNo);
    if (asset) asset.status = 'AVAILABLE';
    createNotification(db, rental.userNo, '반납 완료', '기자재 반납이 처리되었습니다.');
    saveMockDb(db);
    return response(null, '반납 처리 성공');
  }
  return null;
}

function handleRooms(db, method, url, payload, params) {
  const user = currentUser(db);
  if (method === 'get' && url.endsWith('/api/rooms')) {
    return response(db.rooms, '공간 목록 조회 성공');
  }
  if (method === 'get' && url.match(/\/api\/rooms\/\d+$/)) {
    const roomNo = parseId(url);
    const room = db.rooms.find((item) => item.roomNo === roomNo);
    if (!room) return fail('공간을 찾을 수 없습니다.', 404);
    return response(room, '공간 상세 조회 성공');
  }
  if (method === 'get' && url.match(/\/api\/rooms\/\d+\/reservations$/)) {
    const roomNo = parseId(url);
    return response(db.reservations.filter((item) => item.roomNo === roomNo), '공간 예약 현황 조회 성공');
  }
  if (method === 'post' && url.match(/\/api\/rooms\/\d+\/reservations$/)) {
    if (!user) return fail('인증이 필요합니다.', 401);
    const roomNo = parseId(url);
    const room = db.rooms.find((item) => item.roomNo === roomNo);
    if (!room || room.status !== 'AVAILABLE') return fail('예약 가능한 공간이 아닙니다.');
    const reservation = {
      reservationNo: nextId(db, 'reservationNo'),
      roomNo,
      userNo: user.userNo,
      reservationDate: payload.reservationDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
      status: 'RESERVED',
      createdAt: new Date().toISOString()
    };
    const conflict = db.reservations.some((item) => item.roomNo === roomNo && item.reservationDate === payload.reservationDate && item.status === 'RESERVED' && item.startTime < payload.endTime && item.endTime > payload.startTime);
    if (conflict) return fail('이미 예약된 시간입니다.');
    db.reservations.unshift(reservation);
    saveMockDb(db);
    return response(reservation, '공간 예약 신청 성공');
  }
  if (method === 'get' && url.endsWith('/api/reservations/my')) {
    if (!user) return fail('인증이 필요합니다.', 401);
    return response(db.reservations.filter((item) => item.userNo === user.userNo), '내 예약 내역 조회 성공');
  }
  if (method === 'delete' && url.match(/\/api\/reservations\/\d+$/)) {
    if (!user) return fail('인증이 필요합니다.', 401);
    const reservationNo = parseId(url);
    const reservation = db.reservations.find((item) => item.reservationNo === reservationNo);
    if (!reservation) return fail('예약을 찾을 수 없습니다.', 404);
    reservation.status = 'CANCELLED';
    createNotification(db, reservation.userNo, '예약 취소', '예약이 취소되었습니다.');
    saveMockDb(db);
    return response(null, '예약 취소 성공');
  }
  if (method === 'post' && url.endsWith('/api/admin/rooms')) {
    ensureUser(db);
    const room = {
      roomNo: nextId(db, 'roomNo'),
      roomName: payload.roomName,
      location: payload.location || '',
      capacity: Number(payload.capacity || 0),
      status: 'AVAILABLE',
      createdAt: new Date().toISOString()
    };
    db.rooms.unshift(room);
    saveMockDb(db);
    return response(room, '공간 등록 성공');
  }
  if (method === 'put' && url.match(/\/api\/admin\/rooms\/\d+$/)) {
    ensureUser(db);
    const roomNo = parseId(url);
    const room = db.rooms.find((item) => item.roomNo === roomNo);
    if (!room) return fail('공간을 찾을 수 없습니다.', 404);
    Object.assign(room, { roomName: payload.roomName, location: payload.location || '', capacity: Number(payload.capacity || 0) });
    saveMockDb(db);
    return response(room, '공간 수정 성공');
  }
  if (method === 'patch' && url.match(/\/api\/admin\/rooms\/\d+\/disable$/)) {
    ensureUser(db);
    const roomNo = parseId(url);
    const room = db.rooms.find((item) => item.roomNo === roomNo);
    if (!room) return fail('공간을 찾을 수 없습니다.', 404);
    room.status = 'DISABLED';
    saveMockDb(db);
    return response(null, '공간 비활성화 성공');
  }
  if (method === 'get' && url.endsWith('/api/admin/rooms/reservations')) {
    ensureUser(db);
    return response(db.reservations, '전체 예약 조회 성공');
  }
  if (method === 'get' && url.endsWith('/api/admin/dashboard/stats')) {
    ensureUser(db);
    const stats = {
      totalUsers: db.users.length,
      pendingReports: db.reports.filter((item) => ['RECEIVED', 'CHECKING'].includes(item.status)).length,
      requestedRentals: db.rentals.filter((item) => item.rentalStatus === 'REQUESTED').length,
      todayReservations: db.reservations.filter((item) => item.reservationDate === new Date().toISOString().slice(0, 10)).length,
      recentNotices: db.notices.slice(0, 5),
      recentReports: db.reports.slice(0, 5)
    };
    return response(stats, '대시보드 조회 성공');
  }
  return null;
}

function handleNotifications(db, method, url) {
  const user = currentUser(db);
  if (method === 'get' && url.endsWith('/api/notifications')) {
    if (!user) return fail('인증이 필요합니다.', 401);
    return response(db.notifications.filter((item) => item.userNo === user.userNo), '알림 목록 조회 성공');
  }
  if (method === 'patch' && url.match(/\/api\/notifications\/\d+\/read$/)) {
    if (!user) return fail('인증이 필요합니다.', 401);
    const notificationNo = parseId(url);
    const notification = db.notifications.find((item) => item.notificationNo === notificationNo && item.userNo === user.userNo);
    if (notification) notification.readYn = true;
    saveMockDb(db);
    return response(null, '읽음 처리 성공');
  }
  if (method === 'get' && url.endsWith('/api/notifications/unread-count')) {
    if (!user) return fail('인증이 필요합니다.', 401);
    return response(db.notifications.filter((item) => item.userNo === user.userNo && !item.readYn).length, '읽지 않은 알림 개수 조회 성공');
  }
  return null;
}

export function handleMockRequest(config) {
  const db = loadMockDb();
  const url = config.url || '';
  const method = String(config.method || 'get').toLowerCase();
  const payload = config.data ? JSON.parse(config.data) : undefined;
  const params = config.params || {};

  const handlers = [
    () => handleAuth(db, method, url, payload),
    () => handleNotices(db, method, url, payload, params),
    () => handleReports(db, method, url, payload, params),
    () => handleAssets(db, method, url, payload, params),
    () => handleRooms(db, method, url, payload, params),
    () => handleNotifications(db, method, url, payload, params)
  ];

  for (const handler of handlers) {
    const result = handler();
    if (result) {
      if (result.then) return result;
      return result;
    }
  }

  return fail(`Mock API 경로를 찾지 못했습니다: ${method.toUpperCase()} ${url}`, 404);
}
