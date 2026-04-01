package nhom7.J2EE.SpendwiseAI.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void guiEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("Spendwise AI <cuong007266@gmail.com>");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }

    @Async
    public void guiEmailVoiDinhKem(String to, String subject, String text, String fileName, byte[] attachment) {
        try {
            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom("Spendwise AI <cuong007266@gmail.com>");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, true); // true = isHtml
            
            helper.addAttachment(fileName, new org.springframework.core.io.ByteArrayResource(attachment));

            mailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Lỗi gửi email đính kèm: " + e.getMessage());
        }
    }
}
