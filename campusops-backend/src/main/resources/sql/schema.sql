CREATE TABLE IF NOT EXISTS users (
    user_no BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    user_pw VARCHAR(255) NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    profile_image_url TEXT,
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notice (
    notice_no BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    important_yn BOOLEAN DEFAULT false,
    view_count BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS facility_report (
    report_no BIGSERIAL PRIMARY KEY,
    user_no BIGINT NOT NULL REFERENCES users(user_no) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    place VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    status VARCHAR(30) DEFAULT 'RECEIVED',
    admin_reply TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asset (
    asset_no BIGSERIAL PRIMARY KEY,
    asset_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    status VARCHAR(30) DEFAULT 'AVAILABLE',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asset_rental (
    rental_no BIGSERIAL PRIMARY KEY,
    asset_no BIGINT NOT NULL REFERENCES asset(asset_no) ON DELETE CASCADE,
    user_no BIGINT NOT NULL REFERENCES users(user_no) ON DELETE CASCADE,
    rental_status VARCHAR(30) DEFAULT 'REQUESTED',
    rental_date TIMESTAMP,
    return_due_date TIMESTAMP,
    returned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room (
    room_no BIGSERIAL PRIMARY KEY,
    room_name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    capacity INTEGER,
    status VARCHAR(30) DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room_reservation (
    reservation_no BIGSERIAL PRIMARY KEY,
    room_no BIGINT NOT NULL REFERENCES room(room_no) ON DELETE CASCADE,
    user_no BIGINT NOT NULL REFERENCES users(user_no) ON DELETE CASCADE,
    reservation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(30) DEFAULT 'RESERVED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification (
    notification_no BIGSERIAL PRIMARY KEY,
    user_no BIGINT NOT NULL REFERENCES users(user_no) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    read_yn BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS file_attachment (
    attachment_no BIGSERIAL PRIMARY KEY,
    target_type VARCHAR(30) NOT NULL,
    target_no BIGINT NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    content_type VARCHAR(100),
    file_size BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notice_important_created ON notice (important_yn DESC, notice_no DESC);
CREATE INDEX IF NOT EXISTS idx_report_user_no ON facility_report (user_no);
CREATE INDEX IF NOT EXISTS idx_asset_rental_user_no ON asset_rental (user_no);
CREATE INDEX IF NOT EXISTS idx_room_reservation_room_date ON room_reservation (room_no, reservation_date);
CREATE INDEX IF NOT EXISTS idx_notification_user_read ON notification (user_no, read_yn);
CREATE INDEX IF NOT EXISTS idx_file_attachment_target ON file_attachment (target_type, target_no, attachment_no DESC);
