package nhom7.J2EE.SpendwiseAI;

import org.junit.jupiter.api.Test;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class FixDataTest {

    @Test
    public void fixCategoryTypes() {
        String url = "jdbc:postgresql://ep-summer-base-a1afj85t-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
        String user = "neondb_owner";
        String password = "npg_J9jBKen3LdYa";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Connected to Neon DB!");
            
            String updateExpense = "UPDATE danh_muc SET loai = 'chi' WHERE loai = 'expense'";
            try (PreparedStatement pstmt = conn.prepareStatement(updateExpense)) {
                int count = pstmt.executeUpdate();
                System.out.println("Updated " + count + " categories from 'expense' to 'chi'.");
            }
            
            String updateIncome = "UPDATE danh_muc SET loai = 'thu' WHERE loai = 'income'";
            try (PreparedStatement pstmt = conn.prepareStatement(updateIncome)) {
                int count = pstmt.executeUpdate();
                System.out.println("Updated " + count + " categories from 'income' to 'thu'.");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
