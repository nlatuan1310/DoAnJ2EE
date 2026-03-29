package nhom7.J2EE.SpendwiseAI.dat_trinh;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "budgets")
@Data
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category;      // Ví dụ: "Ăn uống", "Di chuyển"
    private Double limitAmount;   // Ngân sách tối đa (Ví dụ: 5.000.000)
    private Double currentSpent;  // Số tiền đã tiêu thực tế
    private String monthYear;     // Định dạng "2026-03"
}
