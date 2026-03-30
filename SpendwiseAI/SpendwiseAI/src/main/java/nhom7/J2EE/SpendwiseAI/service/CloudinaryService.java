package nhom7.J2EE.SpendwiseAI.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }

    /**
     * Upload file bytes lên Cloudinary.
     * Trả về URL công khai (secure URL) của file vừa upload.
     *
     * @param fileBytes nội dung file
     * @param publicId  tên file trên Cloudinary (không cần extension)
     * @param folder    thư mục lưu trên Cloudinary (e.g. "reports")
     * @param resourceType "raw" cho PDF/Excel, "image" cho ảnh
     * @return URL công khai trỏ đến file trên Cloudinary
     */
    public String uploadFile(byte[] fileBytes, String publicId, String folder, String resourceType) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(fileBytes, ObjectUtils.asMap(
                    "public_id", publicId,
                    "folder", folder,
                    "resource_type", resourceType,
                    "overwrite", true
            ));
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi upload file lên Cloudinary: " + e.getMessage(), e);
        }
    }

    /**
     * Xóa file khỏi Cloudinary theo public_id.
     *
     * @param publicId    public_id đầy đủ (bao gồm folder), VD: "reports/BaoCao_abc123"
     * @param resourceType "raw" hoặc "image"
     */
    public void deleteFile(String publicId, String resourceType) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", resourceType));
        } catch (IOException e) {
            System.err.println("Không thể xóa file trên Cloudinary: " + e.getMessage());
        }
    }
}
