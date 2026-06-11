package com.campusops.dao;

import com.campusops.vo.AssetRentalVO;
import com.campusops.vo.AssetVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AssetDao {
    List<AssetVO> selectAssets();
    AssetVO selectAsset(@Param("assetNo") Long assetNo);
    int insertAsset(AssetVO assetVO);
    int updateAsset(AssetVO assetVO);
    int disableAsset(@Param("assetNo") Long assetNo);
    int updateAssetStatus(@Param("assetNo") Long assetNo, @Param("status") String status);
    int insertRental(AssetRentalVO rentalVO);
    List<AssetRentalVO> selectMyRentals(@Param("userNo") Long userNo);
    List<AssetRentalVO> selectAllRentals();
    AssetRentalVO selectRental(@Param("rentalNo") Long rentalNo);
    int updateRentalStatus(@Param("rentalNo") Long rentalNo, @Param("status") String status);
    int countRequestedRentals();
}
