package nhom7.J2EE.SpendwiseAI.service;

import lombok.RequiredArgsConstructor;
import nhom7.J2EE.SpendwiseAI.dto.ThongKeDTO;
import nhom7.J2EE.SpendwiseAI.repository.GiaoDichRepository;
import nhom7.J2EE.SpendwiseAI.repository.GiaoDichTagsRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ThongKeService {

    private final GiaoDichRepository giaoDichRepository;
    private final GiaoDichTagsRepository giaoDichTagsRepository;

    public List<ThongKeDTO.CategorySummary> thongKeTheoDanhMuc(UUID nguoiDungId, LocalDateTime start, LocalDateTime end) {
        List<Object[]> results = giaoDichRepository.thongKeTheoDanhMuc(nguoiDungId, start, end);
        
        BigDecimal totalAll = results.stream()
                .map(r -> (BigDecimal) r[4])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return results.stream().map(r -> {
            BigDecimal amount = (BigDecimal) r[4];
            Double percent = 0.0;
            if (totalAll.compareTo(BigDecimal.ZERO) > 0) {
                percent = amount.multiply(new BigDecimal(100))
                        .divide(totalAll, 2, RoundingMode.HALF_UP)
                        .doubleValue();
            }
            return ThongKeDTO.CategorySummary.builder()
                    .danhMucId((Integer) r[0])
                    .tenDanhMuc((String) r[1])
                    .mauSac((String) r[2])
                    .icon((String) r[3])
                    .tongTien(amount)
                    .phanTram(percent)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<ThongKeDTO.TagSummary> thongKeTheoTag(UUID nguoiDungId, LocalDateTime start, LocalDateTime end) {
        List<Object[]> results = giaoDichTagsRepository.thongKeTheoTag(nguoiDungId, start, end);
        
        return results.stream().map(r -> ThongKeDTO.TagSummary.builder()
                .tagId((Integer) r[0])
                .tenTag((String) r[1])
                .tongTien((BigDecimal) r[2])
                .build()).collect(Collectors.toList());
    }

    public List<Object[]> thongKeTheoNgay(UUID nguoiDungId, LocalDateTime start, LocalDateTime end) {
        return giaoDichRepository.thongKeTheoNgay(nguoiDungId, start, end);
    }
}
