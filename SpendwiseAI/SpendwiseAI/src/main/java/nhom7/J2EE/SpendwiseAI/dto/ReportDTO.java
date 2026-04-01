package nhom7.J2EE.SpendwiseAI.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReportDTO {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private UUID walletId;
    private String format; // excel or pdf
    private String type; // monthly or yearly
}
