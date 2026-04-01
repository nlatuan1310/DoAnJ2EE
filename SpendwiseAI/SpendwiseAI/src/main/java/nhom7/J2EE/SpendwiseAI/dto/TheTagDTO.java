package nhom7.J2EE.SpendwiseAI.dto;

import lombok.*;

public class TheTagDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TheTagRequest {
        @jakarta.validation.constraints.NotBlank(message = "Tên thẻ không được để trống")
        @jakarta.validation.constraints.Size(max = 50, message = "Tên thẻ không quá 50 ký tự")
        private String tenTag;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TheTagResponse {
        private Integer id;
        private String tenTag;
    }
}
