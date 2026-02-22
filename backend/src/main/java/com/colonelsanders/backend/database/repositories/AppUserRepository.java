package com.colonelsanders.backend.database.repositories;

import com.colonelsanders.backend.database.models.AppUser;
import org.springframework.data.repository.CrudRepository;

public interface AppUserRepository extends CrudRepository<AppUser, Long> {
}
