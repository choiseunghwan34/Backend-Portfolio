package com.campusops.dao;

import com.campusops.vo.UserVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserDao {
    int insertUser(UserVO userVO);
    UserVO selectByUserId(@Param("userId") String userId);
    UserVO selectByEmail(@Param("email") String email);
    UserVO selectByUserNo(@Param("userNo") Long userNo);
    int countUsers();
}
