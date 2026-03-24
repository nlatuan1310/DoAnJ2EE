package nhom7.J2EE.SpendwiseAI.dto;

import lombok.*;

import java.util.UUID;

public class DanhMucDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DanhMucRequest {
        @jakarta.validation.constraints.NotBlank(message = "Tên danh mục không được để trống")
        @jakarta.validation.constraints.Size(max = 100, message = "Tên danh mục không quá 100 ký tự")
        private String tenDanhMuc;

        @jakarta.validation.constraints.NotBlank(message = "Loại danh mục (thu/chi) không được để trống")
        private String loai; // thu / chi

        private String icon;
        private String mauSac;
    }


    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DanhMucResponse {
        private Integer id;
        private String tenDanhMuc;
        private String loai;
        private String icon;
        private String mauSac;
    }
}
