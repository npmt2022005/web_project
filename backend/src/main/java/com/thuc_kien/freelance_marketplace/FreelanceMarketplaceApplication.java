package com.thuc_kien.freelance_marketplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class FreelanceMarketplaceApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.load();

        System.setProperty("STRIPE_API_KEY", dotenv.get("STRIPE_API_KEY"));
        System.setProperty("WEB_HOOK_SECRET", dotenv.get("WEB_HOOK_SECRET"));

		System.setProperty("DB_URL", dotenv.get("DB_URL"));
		System.setProperty("DB_USERNAME", dotenv.get("DB_USERNAME"));
		System.setProperty("DB_PASSWORD", dotenv.get("DB_PASSWORD"));

		System.setProperty("CLOUD_NAME", dotenv.get("CLOUD_NAME"));
		System.setProperty("CLOUD_API_KEY", dotenv.get("CLOUD_API_KEY"));
		System.setProperty("CLOUD_API_SECRET", dotenv.get("CLOUD_API_SECRET"));

		

		SpringApplication.run(FreelanceMarketplaceApplication.class, args);
		
	}

}

