package nhom7.J2EE.SpendwiseAI.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudStorageService {

    private static final Logger log = LoggerFactory.getLogger(CloudStorageService.class);
    private final Cloudinary cloudinary;

    public CloudStorageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Tải ảnh lên Cloudinary
     * @param file File ảnh từ người dùng
     * @return Map chứa "url" và "public_id" của hình ảnh
     * @throws IOException Nếu không thể đọc file
     */
    public Map<String, Object> uploadImage(MultipartFile file) throws IOException {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "spendwise/snaps",
                    "resource_type", "auto"
            ));
            log.info("Uploaded to Cloudinary: {}", uploadResult.get("secure_url"));
            return uploadResult;
        } catch (Exception e) {
            log.error("Failed to upload image to Cloudinary", e);
            throw new RuntimeException("Lỗi khi tải ảnh lên Cloud: " + e.getMessage());
        }
    }

    /**
     * Xóa ảnh khỏi Cloudinary
     * @param publicId ID công khai của ảnh
     */
    public void deleteImage(String publicId) {
        if (publicId == null || publicId.isBlank()) return;
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Deleted image from Cloudinary: {}", publicId);
        } catch (Exception e) {
            log.error("Failed to delete image from Cloudinary for id {}", publicId, e);
        }
    }
}
