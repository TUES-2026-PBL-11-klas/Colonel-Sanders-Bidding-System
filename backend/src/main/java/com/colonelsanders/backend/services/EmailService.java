package com.colonelsanders.backend.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendCredentials(String recipientEmail, String generatedPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(recipientEmail);
        message.setSubject("Your closed auction account credentials");
        message.setText(
                "Hello,\n\n"
                + "You have been invited to participate in the closed auction system for clearing company inventoty.\n"
                + "An account has been created for you on the CrispyBid Bidding System.\n\n"
                + "Email: " + recipientEmail + "\n"
                + "Authentication key: " + generatedPassword + "\n\n"
                + "Please log in and set up your password as soon as possible.\n\n"
                + "Regards,\nCrispyBid team."
        );
        mailSender.send(message);
    }
}
