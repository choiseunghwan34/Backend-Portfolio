export const reportStatusLabels = {
  RECEIVED: '접수',
  CHECKING: '확인 중',
  COMPLETED: '처리 완료',
  REJECTED: '반려'
};

export const rentalStatusLabels = {
  REQUESTED: '승인 대기',
  APPROVED: '대여 승인',
  REJECTED: '대여 반려',
  RETURNED: '반납 완료',
  OVERDUE: '연체'
};

export const reservationStatusLabels = {
  RESERVED: '예약 중',
  CANCELLED: '취소됨',
  COMPLETED: '이용 완료'
};

export const assetStatusLabels = {
  AVAILABLE: '대여 가능',
  RENTED: '대여 중',
  DISABLED: '사용 중지'
};

export const roomStatusLabels = {
  AVAILABLE: '예약 가능',
  DISABLED: '운영 중지'
};

export function labelOf(map, value, fallback = '확인 필요') {
  if (!value) return fallback;
  return map[value] || fallback;
}

export function assetTitle(item = {}) {
  return item.assetName || item.asset_name || (item.assetNo ? `등록 기자재 ${item.assetNo}` : '등록 기자재');
}

export function roomTitle(item = {}) {
  return item.roomName || item.room_name || (item.roomNo ? `등록 공간 ${item.roomNo}` : '등록 공간');
}
