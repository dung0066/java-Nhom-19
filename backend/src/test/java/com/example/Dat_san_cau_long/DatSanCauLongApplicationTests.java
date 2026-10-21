package com.example.Dat_san_cau_long;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class DatSanCauLongApplicationTests extends AbstractIntegrationTest {

    @Test
    void contextLoadsAndSchemaValidated() {
        assertTrue(MYSQL_CONTAINER.isRunning());
    }
}
