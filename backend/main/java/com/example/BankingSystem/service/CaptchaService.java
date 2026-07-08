package com.example.BankingSystem.service;

import org.springframework.stereotype.Service;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Random;
import javax.imageio.ImageIO;

@Service
public class CaptchaService {
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private final Random random = new Random();

    /**
     * Sinh text CAPTCHA ngẫu nhiên gồm 5 chữ/số dễ đọc (đã bỏ đi O, 0, I, 1)
     */
    public String generateText() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 5; i++) {
            sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        return sb.toString();
    }

    /**
     * Vẽ ảnh CAPTCHA chứa text truyền vào và trả về dạng Base64 PNG string
     */
    public String generateImageBase64(String text) {
        int width = 120;
        int height = 40;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();

        // Nền sáng nhẹ
        g.setColor(new Color(240, 245, 245));
        g.fillRect(0, 0, width, height);

        // Tạo các đường thẳng gây nhiễu để bot không đọc được
        g.setColor(new Color(180, 200, 200));
        for (int i = 0; i < 6; i++) {
            int x1 = random.nextInt(width);
            int y1 = random.nextInt(height);
            int x2 = random.nextInt(width);
            int y2 = random.nextInt(height);
            g.drawLine(x1, y1, x2, y2);
        }

        // Tạo các chấm tròn gây nhiễu
        for (int i = 0; i < 30; i++) {
            int x = random.nextInt(width);
            int y = random.nextInt(height);
            g.setColor(new Color(random.nextInt(255), random.nextInt(255), random.nextInt(255), 100));
            g.fillOval(x, y, 2, 2);
        }

        // Vẽ từng chữ với độ nghiêng và màu sắc khác nhau
        g.setFont(new Font("Arial", Font.BOLD | Font.ITALIC, 22));
        for (int i = 0; i < text.length(); i++) {
            g.setColor(new Color(random.nextInt(100), random.nextInt(100), random.nextInt(150)));
            String ch = String.valueOf(text.charAt(i));
            
            // Xoay nghiêng chữ nhẹ
            int degree = random.nextInt(30) - 15; // -15 độ đến +15 độ
            double angle = Math.toRadians(degree);
            
            int x = 12 + i * 20;
            int y = 26 + random.nextInt(8) - 4;
            
            g.rotate(angle, x, y);
            g.drawString(ch, x, y);
            g.rotate(-angle, x, y); // reset rotation
        }

        g.dispose();

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ImageIO.write(image, "png", baos);
            return Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Không thể tạo ảnh CAPTCHA", e);
        }
    }
}
