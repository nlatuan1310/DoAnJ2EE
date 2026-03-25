package nhom7.J2EE.SpendwiseAI.specification;

import nhom7.J2EE.SpendwiseAI.entity.GiaoDich;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Truy vấn động cho GiaoDich (Advanced Search).
 * Dùng JPA Criteria API để kết hợp nhiều điều kiện lọc linh hoạt.
 */
public class GiaoDichSpecification {

    /** Lọc theo người dùng (bắt buộc) */
    public static Specification<GiaoDich> thuocNguoiDung(UUID nguoiDungId) {
        return (root, query, cb) ->
                cb.equal(root.get("nguoiDung").get("id"), nguoiDungId);
    }

    /** Tìm theo từ khóa (trong mô tả hoặc tên danh mục) */
    public static Specification<GiaoDich> chứaTuKhoa(String keyword) {
        return (root, query, cb) -> {
            String pattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("moTa")), pattern),
                    cb.like(cb.lower(root.get("danhMuc").get("tenDanhMuc")), pattern)
            );
        };
    }

    /** Lọc theo loại giao dịch (income / expense) */
    public static Specification<GiaoDich> theoLoai(String loai) {
        return (root, query, cb) ->
                cb.equal(cb.lower(root.get("loai")), loai.toLowerCase());
    }

    /** Lọc từ ngày */
    public static Specification<GiaoDich> tuNgay(LocalDateTime tuNgay) {
        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("ngayGiaoDich"), tuNgay);
    }

    /** Lọc đến ngày */
    public static Specification<GiaoDich> denNgay(LocalDateTime denNgay) {
        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("ngayGiaoDich"), denNgay);
    }

    /** Lọc từ số tiền */
    public static Specification<GiaoDich> tuSoTien(BigDecimal tuSoTien) {
        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("soTien"), tuSoTien);
    }

    /** Lọc đến số tiền */
    public static Specification<GiaoDich> denSoTien(BigDecimal denSoTien) {
        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("soTien"), denSoTien);
    }

    /** Lọc theo danh mục */
    public static Specification<GiaoDich> theoDanhMuc(Integer danhMucId) {
        return (root, query, cb) ->
                cb.equal(root.get("danhMuc").get("id"), danhMucId);
    }
}
