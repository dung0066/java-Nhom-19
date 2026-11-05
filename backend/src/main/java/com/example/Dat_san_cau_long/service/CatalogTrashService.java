package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.exception.ResourceNotFoundException;
import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.model.Court;
import com.example.Dat_san_cau_long.model.enums.BookingDetailStatus;
import com.example.Dat_san_cau_long.repository.BookingDetailRepository;
import com.example.Dat_san_cau_long.repository.BookingRepository;
import com.example.Dat_san_cau_long.repository.BranchRepository;
import com.example.Dat_san_cau_long.repository.CourtRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Xóa tạm (thùng rác) cho chi nhánh và sân đấu.
 * - Xóa tạm: đánh dấu deleted_at, chi nhánh/sân biến mất khỏi mọi danh sách và màn hình đặt sân nhưng lịch sử đơn vẫn nguyên.
 *   Xóa tạm chi nhánh thì các sân đang hoạt động của nó bị xóa tạm cùng lúc (cùng mốc thời gian).
 * - Khôi phục: bỏ đánh dấu; khôi phục chi nhánh thì khôi phục luôn các sân bị xóa cùng lúc với nó.
 * - Xóa vĩnh viễn: chỉ áp dụng cho mục đang trong thùng rác và chưa từng có đơn đặt sân.
 */
@Service
public class CatalogTrashService {

    private final BranchRepository branchRepository;
    private final CourtRepository courtRepository;
    private final BookingRepository bookingRepository;
    private final BookingDetailRepository bookingDetailRepository;

    public CatalogTrashService(BranchRepository branchRepository,
                               CourtRepository courtRepository,
                               BookingRepository bookingRepository,
                               BookingDetailRepository bookingDetailRepository) {
        this.branchRepository = branchRepository;
        this.courtRepository = courtRepository;
        this.bookingRepository = bookingRepository;
        this.bookingDetailRepository = bookingDetailRepository;
    }

    // ==================== XÓA TẠM ====================

    @Transactional
    public String softDeleteBranch(Long id) {
        Branch branch = branchRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh ID: " + id));

        long upcoming = bookingDetailRepository.countUpcomingByBranchId(id, BookingDetailStatus.BOOKED, LocalDate.now());
        if (upcoming > 0) {
            throw new IllegalStateException("Chi nhánh còn " + upcoming
                    + " lượt đặt sân chưa diễn ra nên chưa thể xóa. Hãy chờ các lượt đặt kết thúc hoặc hủy chúng trước!");
        }

        LocalDateTime now = LocalDateTime.now().withNano(0);
        branch.setDeletedAt(now);
        branchRepository.save(branch);
        for (Court court : courtRepository.findByBranchIdOrderByCourtNumberAsc(id)) {
            court.setDeletedAt(now);
            courtRepository.save(court);
        }
        return "Đã chuyển chi nhánh " + branch.getName() + " và các sân của nó vào thùng rác!";
    }

    @Transactional
    public String softDeleteCourt(Long id) {
        Court court = courtRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân ID: " + id));

        long upcoming = bookingDetailRepository.countUpcomingByCourtId(id, BookingDetailStatus.BOOKED, LocalDate.now());
        if (upcoming > 0) {
            throw new IllegalStateException("Sân này còn " + upcoming
                    + " lượt đặt chưa diễn ra nên chưa thể xóa. Hãy chờ các lượt đặt kết thúc hoặc hủy chúng trước!");
        }

        court.setDeletedAt(LocalDateTime.now().withNano(0));
        courtRepository.save(court);
        return "Đã chuyển " + court.getName() + " vào thùng rác!";
    }

    // ==================== THÙNG RÁC ====================

    public List<Branch> listTrashedBranches() {
        return branchRepository.findByDeletedAtIsNotNullOrderByDeletedAtDesc();
    }

    public List<Court> listTrashedCourts() {
        return courtRepository.findByDeletedAtIsNotNullOrderByDeletedAtDesc();
    }

    // ==================== KHÔI PHỤC ====================

    @Transactional
    public String restoreBranch(Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh ID: " + id));
        if (branch.getDeletedAt() == null) {
            throw new IllegalStateException("Chi nhánh này không nằm trong thùng rác!");
        }

        LocalDateTime deletedAt = branch.getDeletedAt();
        branch.setDeletedAt(null);
        branchRepository.save(branch);
        // Chỉ khôi phục các sân bị xóa cùng lúc với chi nhánh; sân đã bị xóa riêng từ trước vẫn ở lại thùng rác
        List<Court> cascaded = courtRepository.findByBranchIdAndDeletedAt(id, deletedAt);
        for (Court court : cascaded) {
            court.setDeletedAt(null);
            courtRepository.save(court);
        }
        return "Đã khôi phục chi nhánh " + branch.getName() + " cùng " + cascaded.size() + " sân!";
    }

    @Transactional
    public String restoreCourt(Long id) {
        Court court = courtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân ID: " + id));
        if (court.getDeletedAt() == null) {
            throw new IllegalStateException("Sân này không nằm trong thùng rác!");
        }
        if (court.getBranch().getDeletedAt() != null) {
            throw new IllegalStateException("Chi nhánh " + court.getBranch().getName()
                    + " của sân này đang nằm trong thùng rác. Hãy khôi phục chi nhánh trước!");
        }
        court.setDeletedAt(null);
        courtRepository.save(court);
        return "Đã khôi phục " + court.getName() + " của chi nhánh " + court.getBranch().getName() + "!";
    }

    // ==================== XÓA VĨNH VIỄN ====================

    @Transactional
    public String permanentlyDeleteBranch(Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh ID: " + id));
        if (branch.getDeletedAt() == null) {
            throw new IllegalStateException("Chỉ xóa vĩnh viễn được chi nhánh đang nằm trong thùng rác!");
        }
        long bookingCount = bookingRepository.countByBranchId(id);
        if (bookingCount > 0) {
            throw new IllegalStateException("Chi nhánh đã có " + bookingCount
                    + " đơn đặt sân nên không thể xóa vĩnh viễn (cần giữ lịch sử). Hãy để nó trong thùng rác!");
        }
        courtRepository.deleteByBranchId(id);
        branchRepository.deleteById(id);
        return "Đã xóa vĩnh viễn chi nhánh " + branch.getName() + "!";
    }

    @Transactional
    public String permanentlyDeleteCourt(Long id) {
        Court court = courtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân ID: " + id));
        if (court.getDeletedAt() == null) {
            throw new IllegalStateException("Chỉ xóa vĩnh viễn được sân đang nằm trong thùng rác!");
        }
        long usedCount = bookingDetailRepository.countByCourtId(id);
        if (usedCount > 0) {
            throw new IllegalStateException("Sân này đã có " + usedCount
                    + " lượt đặt nên không thể xóa vĩnh viễn (cần giữ lịch sử). Hãy để nó trong thùng rác!");
        }
        courtRepository.deleteById(id);
        return "Đã xóa vĩnh viễn " + court.getName() + "!";
    }
}
