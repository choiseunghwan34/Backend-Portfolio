package com.campusops.service.impl;

import com.campusops.dao.AssetDao;
import com.campusops.dto.AssetRequestDTO;
import com.campusops.dto.RentalRequestDTO;
import com.campusops.exception.BusinessException;
import com.campusops.service.AssetService;
import com.campusops.service.NotificationService;
import com.campusops.util.RedisKeys;
import com.campusops.util.SecurityUtil;
import com.campusops.vo.AssetRentalVO;
import com.campusops.vo.AssetVO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetServiceImpl implements AssetService {
    private final AssetDao assetDao;
    private final RedisTemplate<String, Object> redisTemplate;
    private final NotificationService notificationService;

    @Override
    public List<AssetVO> getAssets() {
        return assetDao.selectAssets();
    }

    @Override
    public AssetVO getAsset(Long assetNo) {
        AssetVO asset = assetDao.selectAsset(assetNo);
        if (asset == null) {
            throw new BusinessException("기자재를 찾을 수 없습니다.", 404);
        }
        return asset;
    }

    @Override
    public AssetVO createAsset(AssetRequestDTO request) {
        AssetVO asset = new AssetVO();
        asset.setAssetName(request.getAssetName());
        asset.setCategory(request.getCategory());
        asset.setDescription(request.getDescription());
        asset.setStatus("AVAILABLE");
        assetDao.insertAsset(asset);
        return asset;
    }

    @Override
    public AssetVO updateAsset(Long assetNo, AssetRequestDTO request) {
        AssetVO asset = getAsset(assetNo);
        asset.setAssetName(request.getAssetName());
        asset.setCategory(request.getCategory());
        asset.setDescription(request.getDescription());
        assetDao.updateAsset(asset);
        return asset;
    }

    @Override
    public void disableAsset(Long assetNo) {
        if (assetDao.disableAsset(assetNo) == 0) {
            throw new BusinessException("기자재를 찾을 수 없습니다.", 404);
        }
    }

    @Override
    public AssetRentalVO rentAsset(Long assetNo, RentalRequestDTO request) {
        Long userNo = SecurityUtil.currentPrincipal().getUserNo();
        AssetVO asset = getAsset(assetNo);
        if (!"AVAILABLE".equals(asset.getStatus())) {
            throw new BusinessException("대여 가능한 기자재가 아닙니다.");
        }
        String key = RedisKeys.rentalHold(assetNo, userNo);
        if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            throw new BusinessException("이미 대여 신청이 진행 중입니다.", 429);
        }
        redisTemplate.opsForValue().set(key, "1", Duration.ofMinutes(5));
        AssetRentalVO rental = new AssetRentalVO();
        rental.setAssetNo(assetNo);
        rental.setUserNo(userNo);
        rental.setRentalStatus("REQUESTED");
        rental.setRentalDate(LocalDateTime.now());
        rental.setReturnDueDate(LocalDateTime.now().plusDays(request.getRentalDays()));
        assetDao.insertRental(rental);
        return rental;
    }

    @Override
    public List<AssetRentalVO> getMyRentals() {
        return assetDao.selectMyRentals(SecurityUtil.currentPrincipal().getUserNo());
    }

    @Override
    public List<AssetRentalVO> getAllRentals() {
        return assetDao.selectAllRentals();
    }

    @Override
    public void approveRental(Long rentalNo) {
        AssetRentalVO rental = assetDao.selectRental(rentalNo);
        if (rental == null) {
            throw new BusinessException("대여 신청을 찾을 수 없습니다.", 404);
        }
        assetDao.updateRentalStatus(rentalNo, "APPROVED");
        assetDao.updateAssetStatus(rental.getAssetNo(), "RENTED");
        notificationService.createNotification(rental.getUserNo(), "대여 승인", "대여 신청이 승인되었습니다.");
    }

    @Override
    public void rejectRental(Long rentalNo) {
        AssetRentalVO rental = assetDao.selectRental(rentalNo);
        if (rental == null) {
            throw new BusinessException("대여 신청을 찾을 수 없습니다.", 404);
        }
        assetDao.updateRentalStatus(rentalNo, "REJECTED");
        notificationService.createNotification(rental.getUserNo(), "대여 반려", "대여 신청이 반려되었습니다.");
    }

    @Override
    public void returnRental(Long rentalNo) {
        AssetRentalVO rental = assetDao.selectRental(rentalNo);
        if (rental == null) {
            throw new BusinessException("대여 신청을 찾을 수 없습니다.", 404);
        }
        assetDao.updateRentalStatus(rentalNo, "RETURNED");
        assetDao.updateAssetStatus(rental.getAssetNo(), "AVAILABLE");
        notificationService.createNotification(rental.getUserNo(), "반납 완료", "기자재 반납이 처리되었습니다.");
    }
}
