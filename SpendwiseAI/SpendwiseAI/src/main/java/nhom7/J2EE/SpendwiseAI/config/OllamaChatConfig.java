package nhom7.J2EE.SpendwiseAI.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình ChatClient cho cả hai AI provider:
 * - Gemini (Google GenAI) → dùng cho Auto-Categorization
 * - Ollama (Llama)        → dùng cho RAG Financial Advisor
 */
@Configuration
public class OllamaChatConfig {

    /**
     * ChatClient cho Gemini — dùng bởi AutoCategorizationService.
     */
    @Bean("geminiChatClient")
    public ChatClient geminiChatClient(
            @Qualifier("googleGenAiChatModel") ChatModel geminiChatModel) {
        return ChatClient.builder(geminiChatModel).build();
    }

    /**
     * ChatClient cho Ollama (Llama) — dùng bởi FinancialAdvisorService.
     */
    @Bean("ollamaChatClient")
    public ChatClient ollamaChatClient(
            @Qualifier("ollamaChatModel") ChatModel ollamaChatModel) {
        return ChatClient.builder(ollamaChatModel).build();
    }
}
