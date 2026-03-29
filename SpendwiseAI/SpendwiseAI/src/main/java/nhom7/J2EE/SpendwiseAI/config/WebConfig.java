package nhom7.J2EE.SpendwiseAI.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String reportPath = new File("reports_export").getAbsolutePath();
        registry.addResourceHandler("/reports_export/**")
                .addResourceLocations("file:" + reportPath + "/");
    }
}
