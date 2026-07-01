package com.ruralconnect.service;

import com.ruralconnect.entity.User;
import com.ruralconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User suspendUser(Long userId, boolean suspend) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsSuspended(suspend);
        return userRepository.save(user);
    }
}
