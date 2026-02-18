package com.demo.fxportal.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("FX Quote & Trade Portal API")
                        .version("1.0.0")
                        .description("Educational demo project for FX quote and trade workflow. " +
                                "This API allows users to request FX quotes and book trades. " +
                                "\n\n**Educational demo project — not affiliated with any bank.**")
                        .contact(new Contact()
                                .name("Demo Project")
                                .email("demo@example.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}
