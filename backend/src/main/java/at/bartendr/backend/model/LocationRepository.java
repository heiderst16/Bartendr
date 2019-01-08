package at.bartendr.backend.model;

import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends PagingAndSortingRepository<Location, Long> {
}