package com.campusops.service;

import com.campusops.dto.AssetRequestDTO;
import com.campusops.dto.RentalRequestDTO;
import com.campusops.vo.AssetRentalVO;
import com.campusops.vo.AssetVO;

import java.util.List;

public interface AssetService {
    List<AssetVO> getAssets();
    AssetVO getAsset(Long assetNo);
    AssetVO createAsset(AssetRequestDTO request);
    AssetVO updateAsset(Long assetNo, AssetRequestDTO request);
    void disableAsset(Long assetNo);
    AssetRentalVO rentAsset(Long assetNo, RentalRequestDTO request);
    List<AssetRentalVO> getMyRentals();
    List<AssetRentalVO> getAllRentals();
    void approveRental(Long rentalNo);
    void rejectRental(Long rentalNo);
    void returnRental(Long rentalNo);
}
