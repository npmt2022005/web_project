CREATE DATABASE  IF NOT EXISTS `freelance_marketplace` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `freelance_marketplace`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: freelance_marketplace
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `parent_id` int DEFAULT NULL,
  `img_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Đồ Họa & Thiết Kế','do-hoa-thiet-ke',NULL,NULL),(2,'Lập Trình & Công Nghệ','lap-trinh-cong-nghe',NULL,NULL),(3,'Tiếp Thị Kỹ Thuật Số','tiep-thi-ky-thuat-so',NULL,NULL),(4,'Viết Lách & Dịch Thuật','viet-lach-dich-thuat',NULL,NULL),(5,'Video & Phim Hoạt Hình','video-phim-hoat-hinh',NULL,NULL),(6,'Dịch Vụ AI & Trí Tuệ Nhân Tạo','dich-vu-ai-tri-tue-nhan-tao',NULL,NULL),(7,'Âm Nhạc & Âm Thanh','am-nhac-am-thanh',NULL,NULL),(8,'Kinh Doanh & Quản Lý','kinh-doanh-quan-ly',NULL,NULL),(9,'Tài Chính & Kế Toán','tai-chinh-ke-toan',NULL,NULL),(10,'Dữ Liệu & Phân Tích','du-lieu-phan-tich',NULL,NULL),(11,'Thiết kế Logo & Thương hiệu','thiet-ke-logo-thuong-hieu',1,NULL),(12,'Thiết kế Website (UI/UX)','thiet-ke-website-ui-ux',1,NULL),(13,'Thiết kế Ứng dụng Di động','thiet-ke-ung-dung-di-dong',1,NULL),(14,'Minh họa & Vẽ tranh kỹ thuật số','minh-hoa-ve-tranh-ky-thuat-so',1,NULL),(15,'Thiết kế Bao bì & Ấn phẩm in','thiet-ke-bao-bi-an-pham-in',1,NULL),(16,'Phát triển Website Full-Stack','phat-trien-website-full-stack',2,NULL),(17,'Lập trình Ứng dụng Di động','lap-trinh-ung-dung-di-dong',2,NULL),(18,'Phần mềm Nhúng & Vi điều khiển','phan-mem-nhung-vi-dieu-khien',2,NULL),(19,'Phát triển Hệ thống WordPress','phat-trien-he-thong-wordpress',2,NULL),(20,'Bảo mật & Kiểm thử Xâm nhập (Pentest)','bao-mat-kiem-thu-xam-nhap',2,NULL),(21,'Tối ưu hóa Tìm kiếm (SEO)','toi-uu-hoa-tim-kiem-seo',3,NULL),(22,'Quảng cáo Trả phí (Facebook/Google Ads)','quang-cao-tra-phi-ads',3,NULL),(23,'Quản trị & Tiếp thị Mạng xã hội','quan-tri-tiep-thi-mang-xa-hoi',3,NULL),(24,'Tiếp thị Liên kết (Affiliate Marketing)','tiep-thi-lien-ket',3,NULL),(25,'Chiến lược nội dung Video (TikTok/Youtube)','chien-luoc-noi-dung-video',3,NULL),(26,'Viết bài Blog chuẩn SEO','viet-bai-blog-chuan-seo',4,NULL),(27,'Dịch thuật đa ngôn ngữ','dich-thuat-da-ngon-ngu',4,NULL),(28,'Viết nội dung Trang bán hàng (Copywriting)','viet-noi-dung-trang-ban-hang',4,NULL),(29,'Sáng tác kịch bản phim & quảng cáo','sang-tac-kich-ban',4,NULL),(30,'Biên tập & Chỉnh sửa văn bản','bien-tap-chinh-sua-van-ban',4,NULL),(31,'Dựng phim & Chỉnh sửa Video','dung-phim-chinh-sua-video',5,NULL),(32,'Phim hoạt hình 2D & 3D','phim-hoat-hinh-2d-3d',5,NULL),(33,'Hiệu ứng kỹ xảo (VFX)','hieu-ung-ky-xao-vfx',5,NULL),(34,'Video quảng cáo sản phẩm ngắn','video-quang-cao-san-pham-ngan',5,NULL),(35,'Phụ đề & Thuyết minh phim','phu-de-thuyet-minh-phim',5,NULL),(36,'Xây dựng Trợ lý ảo & AI Agent','xay-dung-tro-ly-ao-ai-agent',6,NULL),(37,'Kỹ nghệ Gợi ý (Prompt Engineering)','ky-nghe-goi-y-prompt-engineering',6,NULL),(38,'Tích hợp API Mô hình Ngôn ngữ lớn (LLM)','tich-hop-api-llm',6,NULL),(39,'Ứng dụng AI tạo hình ảnh & video','ung-dung-ai-tao-hinh-anh-video',6,NULL),(40,'Thu âm & Đọc giọng thuyết minh (Voiceover)','thu-am-doc-giong-thuyet-minh',7,NULL),(41,'Hòa âm, Phối khí & Sản xuất âm nhạc','hoa-am-phoi-khi-san-xuat-am-nhac',7,NULL),(42,'Chỉnh sửa âm thanh & Lọc nhiễu Podcast','chinh-sua-am-thanh-podcast',7,NULL),(43,'Sáng tác nhạc hiệu & Nhạc quảng cáo','sang-tac-nhac-hieu-quang-cao',7,NULL),(44,'Trợ lý ảo từ xa (Virtual Assistant)','tro-ly-ao-tu-xa',8,NULL),(45,'Tư vấn & Lập Kế hoạch Kinh doanh','tu-van-lap-ke-hoach-kinh-doanh',8,NULL),(46,'Quản trị dự án & Vận hành','quan-tri-du-an-van-hanh',8,NULL),(47,'Chăm sóc khách hàng & Trực chat','cham-soc-khach-hang-truc-chat',8,NULL),(48,'Kế toán thuế & Khai báo tài chính','ke-toan-thue-khai-bao-tai-chinh',9,NULL),(49,'Tư vấn đầu tư & Quản lý dòng tiền','tu-van-dau-tu-quan-ly-dong-tien',9,NULL),(50,'Lập mô hình tài chính doanh nghiệp','lap-mo-hinh-tai-chinh-doanh-nghiep',9,NULL),(51,'Dịch vụ Sổ sách kế toán (Bookkeeping)','dich-vu-so-sach-ke-toan',9,NULL),(52,'Tự động hóa & Cào dữ liệu Web (Scraping)','tu-dong-hoa-cao-du-lieu-web',10,NULL),(53,'Phân tích dữ liệu & Trực quan hóa (BI)','phan-tich-du-lieu-truc-quan-hoa',10,NULL),(54,'Khoa học dữ liệu & Học máy (Machine Learning)','khoa-hoc-du-lieu-machine-learning',10,NULL),(55,'Nhập liệu & Chuẩn hóa cơ sở dữ liệu','nhap-lieu-chuan-hoa-co-so-du-lieu',10,NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_one_id` int NOT NULL,
  `user_two_id` int NOT NULL,
  `last_message` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_one_id` (`user_one_id`),
  KEY `user_two_id` (`user_two_id`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`user_one_id`) REFERENCES `users` (`id`),
  CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`user_two_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gigpackages`
--

DROP TABLE IF EXISTS `gigpackages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gigpackages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `gig_id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` text,
  `price` decimal(15,2) NOT NULL,
  `delivery_days` int DEFAULT NULL,
  `revisions` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `gig_id` (`gig_id`),
  CONSTRAINT `gigpackages_ibfk_1` FOREIGN KEY (`gig_id`) REFERENCES `gigs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gigpackages`
--

LOCK TABLES `gigpackages` WRITE;
/*!40000 ALTER TABLE `gigpackages` DISABLE KEYS */;
INSERT INTO `gigpackages` VALUES (1,1,'Basic','Xây dựng 3 API CRUD cơ bản, không bảo mật',50.00,2),(2,1,'Standard','Hệ thống 10 API, tích hợp Spring Security JWT, quản lý phân quyền',150.00,5),(3,1,'Premium','Trọn gói Backend Microservices, kết nối Docker, tối ưu hóa database hoàn chỉnh',400.00,12),(4,2,'Basic','Cào dữ liệu 1 trang web cấu trúc đơn giản, xuất file Excel',30.00,1),(5,2,'Standard','Cào web chứa Javascript động (Render bằng Playwright), bypass captcha cơ bản',90.00,3),(6,2,'Premium','Hệ thống cào dữ liệu tự động đặt lịch (Cronjob), đẩy thẳng dữ liệu vào MySQL của bạn',200.00,5),(7,3,'Basic','Tích hợp API Gemini vào website có sẵn thông qua khung chat đơn giản',100.00,3),(8,3,'Standard','Xây dựng AI Agent có kết nối cơ sở dữ liệu (Function Calling), tự tra cứu thông tin phim/sản phẩm',250.00,7),(9,3,'Premium','Hệ thống RAG AI thông minh, đọc và hiểu tài liệu nội bộ PDF/Docx của doanh nghiệp',600.00,15),(10,4,'Basic','Cài đặt giao diện mẫu, cấu hình trang Landing Page cơ bản',40.00,2),(11,4,'Standard','Website doanh nghiệp hoàn chỉnh (5 trang gồm: Chủ, Giới thiệu, Dịch vụ, Tin tức, Liên hệ)',120.00,4),(12,4,'Premium','Trang thương mại điện tử WordPress tích hợp giỏ hàng, cổng thanh toán trực tuyến',280.00,7),(13,5,'Basic','Viết code đọc cảm biến đơn giản và hiển thị lên màn hình LCD',60.00,3),(14,5,'Standard','Lập trình hệ thống điều khiển có giao tiếp không dây (Wifi/Bluetooth ESP32)',180.00,6),(15,6,'Basic','1 Ý tưởng Logo phác thảo, bàn giao file ảnh PNG chất lượng cao',25.00,2),(16,6,'Standard','3 Ý tưởng Logo độc đáo, bàn giao file gốc thiết kế Vector (AI, SVG), chỉnh sửa 3 lần',70.00,3),(17,6,'Premium','Full bộ nhận diện thương hiệu (Logo, Card visit, Phong bì, Quy chuẩn màu sắc và Font chữ)',200.00,5),(18,7,'Basic','Thiết kế UI cho 1 trang Landing Page đơn giản',80.00,2),(19,7,'Standard','Thiết kế UI/UX trọn gói website giới thiệu (Tối đa 6 trang phối màu độc quyền)',220.00,5),(20,7,'Premium','Hệ thống Dashboard hoặc Web App thương mại điện tử phức tạp (Trên 15 giao diện màn hình)',500.00,10),(21,8,'Basic','Thiết kế Wireframe cấu trúc luồng cho 5 màn hình chính',70.00,3),(22,8,'Standard','Thiết kế giao diện hoàn chỉnh (UI Color) cho 10 màn hình App mượt mà',250.00,6),(23,9,'Basic','Vẽ phác thảo chân dung đen trắng nét vẽ digital',20.00,2),(24,9,'Standard','Vẽ minh họa màu sắc hoàn chỉnh kèm hiệu ứng ánh sáng nghệ thuật',55.00,4),(25,10,'Standard','Tối ưu hóa SEO Onpage lõi cho toàn bộ website và lập kế hoạch từ khóa',150.00,5),(26,10,'Premium','Chiến dịch SEO tổng thể 1 tháng bao gồm đi Backlink và đẩy top 15 từ khóa mục tiêu',450.00,30),(27,11,'Basic','Thiết lập tài khoản quảng cáo, cài mã theo dõi Pixel và lên chiến dịch chạy thử',50.00,3),(28,11,'Standard','Quản lý và tối ưu hóa tài khoản quảng cáo trong 14 ngày (Ngân sách dưới 20 triệu)',140.00,14),(29,12,'Standard','Chăm sóc fanpage trong 1 tháng: Viết 12 bài viết + Thiết kế 12 ảnh đi kèm',110.00,30),(30,13,'Basic','1 Bài viết chuẩn SEO độ dài 800 từ, nội dung độc quyền',15.00,1),(31,13,'Standard','Combo 5 bài viết chuẩn SEO chuyên sâu độ dài 1500 từ/bài',65.00,3),(32,14,'Basic','Dịch thuật tài liệu phổ thông dưới 1000 từ (Anh - Việt hoặc ngược lại)',15.00,1),(33,14,'Standard','Dịch thuật tài liệu chuyên ngành, hợp đồng thương mại kinh tế dưới 3000 từ',45.00,2),(34,15,'Standard','Nội dung chữ hoàn chỉnh cho một trang Landing Page bán hàng cuốn hút',80.00,2),(35,16,'Basic','Đọc kịch bản ngắn dưới 200 từ, định dạng file MP3 chất lượng cao',20.00,1),(36,16,'Standard','Giọng đọc bài thuyết trình, audio thuyết minh video thời lượng dưới 10 phút',60.00,2),(37,17,'Basic','Cắt ghép chỉnh sửa video thô thành video TikTok ngắn 30s-60s',15.00,1),(38,17,'Standard','Dựng video review sản phẩm hoàn chỉnh 3-5 phút, thêm hiệu ứng, nhạc nền bản quyền',50.00,3),(39,18,'Standard','Lập báo cáo tài chính và hoàn thiện sổ sách kế toán thuế quý cho doanh nghiệp nhỏ',120.00,5),(40,19,'Premium','Lập file quản lý tài chính Excel thông minh dự phóng dòng tiền 3 năm và định giá gọi vốn',300.00,7),(41,20,'Basic','Hỗ trợ trực chat và trực hotline chăm sóc khách hàng 3 tiếng/ngày trong 1 tuần',70.00,7);
/*!40000 ALTER TABLE `gigpackages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gigs`
--

DROP TABLE IF EXISTS `gigs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gigs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seller_id` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `is_paused` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `delivery_time` int DEFAULT NULL,
  `price` double DEFAULT NULL,
  `rating_avg` double DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `total_reviews` int DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `seller_id` (`seller_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `gigs_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `gigs_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gigs`
--

LOCK TABLES `gigs` WRITE;
/*!40000 ALTER TABLE `gigs` DISABLE KEYS */;
INSERT INTO `gigs` VALUES (1,1,16,'Thiết kế và phát triển hệ thống REST API chuyên nghiệp bằng Spring Boot','Tôi sẽ xây dựng hệ thống Backend hoàn chỉnh, bảo mật cao sử dụng Spring Boot, Spring Security, JWT và kết nối MySQL/PostgreSQL.','https://images.pexels.com/photos/1181359/pexels-photo-1181359.jpeg',0,'2026-05-27 19:26:46',2,50,5,'phat-trien-rest-api-spring-boot',48,'2026-05-28 02:26:46.000000'),(2,1,52,'Viết Tool tự động hóa và cào dữ liệu Website (Web Scraping) tốc độ cao','Dịch vụ thu thập dữ liệu tự động từ các trang thương mại điện tử, bất động sản, tin tức bằng Playwright, Selenium hoặc Jsoup.','https://images.pexels.com/photos/546814/pexels-photo-546814.jpeg',0,'2026-05-27 19:26:46',1,30,4.9,'viet-tool-cao-du-lieu-web-scraping',36,'2026-05-28 02:26:46.000000'),(3,5,36,'Xãy dựng Trợ lý ảo AI thông minh và tích hợp API Gemini Pro','Phát triển Chatbot AI Agent thế hệ mới, tích hợp cơ chế RAG (Retrieval-Augmented Generation) giúp tra cứu dữ liệu nội bộ doanh nghiệp.','https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',0,'2026-05-27 19:26:46',3,100,5,'xay-dung-tro-ly-ao-ai-agent-gemini',12,'2026-05-28 02:26:46.000000'),(4,1,19,'Thiết kế website trọn gói bằng WordPress và Elementor Pro','Xây dựng website giới thiệu doanh nghiệp, blog cá nhân hoặc trang bán hàng chuẩn SEO, giao diện responsive mượt mà trên mobile.','https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg',0,'2026-05-27 19:26:46',2,40,4.8,'thiet-ke-website-wordpress-elementor',25,'2026-05-28 02:26:46.000000'),(5,1,18,'Lập trình firmware và phần mềm nhúng cho vi điều khiển STM32, Arduino','Thiết kế mạch nguyên lý, lập trình hệ thống nhúng điều khiển thiết bị ngoại vi, đọc cảm biến và truyền thông dữ liệu.','https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg',0,'2026-05-27 19:26:46',3,60,4.9,'lap-trinh-phand-mem-nhung-vi-dieu-khien',14,'2026-05-28 02:26:46.000000'),(6,2,11,'Thiết kế Logo tối giản và bộ nhận diện thương hiệu doanh nghiệp độc quyền','Sáng tạo những mẫu logo hiện đại, tinh tế, truyền tải đúng thông điệp cốt lõi của thương hiệu. Bàn giao đầy đủ file gốc vector.','https://images.pexels.com/photos/4348404/pexels-photo-4348404.jpeg',0,'2026-05-27 19:26:46',2,25,4.9,'thiet-ke-logo-toi-gian-thuong-hieu',94,'2026-05-28 02:26:46.000000'),(7,2,12,'Thiết kế giao diện Website (UI/UX Design) chuyên nghiệp trên Figma','Thiết kế Wireframe, Prototype và UI hoàn chỉnh cho landing page hoặc hệ thống dashboard quản trị, tối ưu trải nghiệm người dùng.','https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg',0,'2026-05-27 19:26:46',2,80,5,'thiet-ke-giao-dien-website-ui-ux-figma',112,'2026-05-28 02:26:46.000000'),(8,2,13,'Thiết kế giao diện ứng dụng di động iOS/Android UI mượt mà','Tạo bản vẽ giao diện app mobile hiện đại, chuẩn Material Design hoặc iOS Human Interface Guidelines trực tiếp trên Figma.','https://images.pexels.com/photos/1092671/pexels-photo-1092671.jpeg',0,'2026-05-27 19:26:46',3,70,4.8,'thiet-ke-giao-dien-app-mobile-ui-ux',67,'2026-05-28 02:26:46.000000'),(9,2,14,'Vẽ minh họa chân dung và thiết kế Artwork kỹ thuật số (Digital Art)','Nhận vẽ tranh minh họa cho sách truyện, bìa album nhạc, hoặc vẽ chân dung stylized làm quà tặng độc đáo theo yêu cầu.','https://images.pexels.com/photos/326503/pexels-photo-326503.jpeg',0,'2026-05-27 19:26:46',2,20,4.7,'ve-minh-hoa-chan-dung-digital-art',41,'2026-05-28 02:26:46.000000'),(10,3,21,'Dịch vụ tối ưu hóa SEO tổng thể giúp Website lên Top Google bền vững','Phân tích từ khóa khóa cạnh tranh, tối ưu SEO Onpage, xây dựng chiến lược nội dung và hệ thống Backlink chất lượng cao.','https://images.pexels.com/photos/267569/pexels-photo-267569.jpeg',0,'2026-05-27 19:26:46',5,150,4.8,'dich-vu-toi-uu-hoa-seo-website-top-google',38,'2026-05-28 02:26:46.000000'),(11,3,22,'Thiết lập và tối ưu chiến dịch quảng cáo Facebook Ads / Google Ads','Lên chiến dịch quảng cáo nhắm đúng mục tiêu, tối ưu chi phí trên mỗi lượt chuyển đổi (CPA), thiết lập remarketing bám đuổi.','https://images.pexels.com/photos/905163/pexels-photo-905163.jpeg',0,'2026-05-27 19:26:46',3,50,4.9,'thiet-lap-toi-uu-quang-cao-ads',29,'2026-05-28 02:26:46.000000'),(12,3,23,'Quản trị nội dung và xây dựng fanpage định kỳ hàng tháng','Thiết kế hình ảnh, viết nội dung bài đăng (8-15 bài/tháng), theo dõi chỉ số tương tác và phản hồi bình luận khách hàng.','https://images.pexels.com/photos/5115624/pexels-photo-5115624.jpeg',0,'2026-05-27 19:26:46',30,110,4.6,'quan-tri-noi-dung-xay-dung-fanpage-thang',18,'2026-05-28 02:26:46.000000'),(13,6,26,'Viết bài viết chuẩn SEO cho Blog, Website đa dạng chủ đề','Cung cấp các bài viết chất lượng, nội dung độc quyền 100% không copy, lồng ghép từ khóa tự nhiên tăng điểm chất lượng SEO.','https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',0,'2026-05-27 19:26:46',1,15,4.9,'viet-bai-viet-chuan-seo-blog-website',12,'2026-05-28 02:26:46.000000'),(14,6,27,'Dịch thuật công chứng tài liệu song ngữ Anh - Việt chuyên nghiệp','Biên dịch chuẩn xác các văn bản pháp lý, hợp đồng kinh tế, hồ sơ du học, tiểu luận chuyên ngành với văn phong mượt mà.','https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg',0,'2026-05-27 19:26:46',1,15,5,'dich-thuat-cong-chung-anh-viet',6,'2026-05-28 02:26:46.000000'),(15,6,28,'Viết nội dung Landing Page bán hàng (Copywriting) tỷ lệ chuyển đổi cao','Sử dụng kỹ thuật thấu hiểu tâm lý khách hàng để viết các tiêu đề giật gân, lời kêu gọi hành động (CTA) sắc bén thúc đẩy doanh số.','https://images.pexels.com/photos/48144/pexels-photo-48144.jpeg',0,'2026-05-27 19:26:46',2,80,4.7,'viet-noi-dung-landing-page-copywriting',5,'2026-05-28 02:26:46.000000'),(16,4,40,'Thu âm giọng đọc thuyết minh, Voiceover chuẩn miền Nam truyền cảm','Cung cấp file thu âm giọng nữ ngọt ngào, chuyên nghiệp cho tổng đài, video quảng cáo TVC, sách nói hoặc video TikTok.','https://images.pexels.com/photos/3783471/pexels-photo-3783471.jpeg',0,'2026-05-27 19:26:46',1,20,5,'thu-am-giong-doc-thuyet-minh-voiceover',142,'2026-05-28 02:26:46.000000'),(17,7,31,'Dựng video ngắn TikTok, Reels chuyên nghiệp, bắt trend','Chỉnh sửa cắt ghép video thô, thêm phụ đề động, hiệu ứng âm thanh sống động giúp video dễ lên xu hướng.','https://images.pexels.com/photos/2510428/pexels-photo-2510428.jpeg',0,'2026-05-27 19:26:46',1,15,4.6,'dung-video-ngan-tiktok-reels-bat-trend',53,'2026-05-28 02:26:46.000000'),(18,8,48,'Dịch vụ làm báo cáo tài chính và quyết toán thuế doanh nghiệp trọn gói','Rà soát sổ sách, kê toán chứng từ, lập báo cáo tài chính cuối năm và đại diện doanh nghiệp giải trình với cơ quan thuế.','https://images.pexels.com/photos/53621/pexels-photo-53621.jpeg',0,'2026-05-27 19:26:46',5,120,4.9,'dich-vu-lam-bao-cao-tai-chinh-thue',41,'2026-05-28 02:26:46.000000'),(19,8,50,'Lập mô hình tài chính và lập phương án gọi vốn kinh doanh','Tạo file excel quản lý dòng tiền dự kiến, phân tích điểm hòa vốn, định giá dự án phục vụ mục đích trình bày với nhà đầu tư.','https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',0,'2026-05-27 19:26:46',7,300,5,'lap-mo-hinh-tai-chinh-phuong-an-goi-von',24,'2026-05-28 02:26:46.000000'),(20,8,44,'Trợ lý ảo hỗ trợ quản lý công việc và chăm sóc khách hàng từ xa','Hỗ trợ check email, quản lý lịch hẹn, xử lý data khách hàng, trực chat fanpage và trực điện thoại xử lý đơn hàng.','https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg',0,'2026-05-27 19:26:46',7,70,4.8,'tro-ly-ao-quan-ly-cong-viec-cham-soc-khach-hang',9,'2026-05-28 02:26:46.000000');
/*!40000 ALTER TABLE `gigs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `message_text` text,
  `file_url` text,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `conversation_id` (`conversation_id`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderrequirements`
--

DROP TABLE IF EXISTS `orderrequirements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderrequirements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `question` text,
  `answer` text,
  `type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `orderrequirements_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderrequirements`
--

LOCK TABLES `orderrequirements` WRITE;
/*!40000 ALTER TABLE `orderrequirements` DISABLE KEYS */;
/*!40000 ALTER TABLE `orderrequirements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `buyer_id` int NOT NULL,
  `package_id` int NOT NULL,
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `total_amount` decimal(15,2) DEFAULT NULL,
  `delivery_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `buyer_id` (`buyer_id`),
  KEY `package_id` (`package_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`package_id`) REFERENCES `gigpackages` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `wallet_id` int NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `wallet_id` (`wallet_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `reviewer_id` int NOT NULL,
  `seller_id` int NOT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `reviewer_id` (`reviewer_id`),
  KEY `seller_id` (`seller_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`),
  CONSTRAINT `reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sellers`
--

DROP TABLE IF EXISTS `sellers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sellers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `bio` text,
  `rating_avg` double DEFAULT NULL,
  `total_reviews` int DEFAULT '0',
  `response_time` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `level` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `sellers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sellers`
--

LOCK TABLES `sellers` WRITE;
/*!40000 ALTER TABLE `sellers` DISABLE KEYS */;
INSERT INTO `sellers` VALUES (1,1,'Lập trình viên chuyên nghiệp hệ Spring Boot, thiết kế hệ thống và cào dữ liệu automation chuyên nghiệp.',5,142,'Trong vòng 1 giờ',1,'Top Rated'),(2,2,'Nhà thiết kế sản phẩm số, chuyên vẽ UI/UX cho Website, App Mobile và bộ nhận diện thương hiệu.',4.9,320,'Trong vòng 1 giờ',1,'Level 2'),(3,3,'Chuyên gia tối ưu hóa SEO Website lên Top Google và tối ưu hóa ngân sách chạy quảng cáo đa kênh.',4.8,85,'Trong vòng 2 giờ',1,'Level 1'),(4,4,'Giọng đọc voiceover chuẩn miền Nam, nhận đọc thuyết minh phim, kịch bản quảng cáo và Podcast.',4.9,215,'Trong vòng 1 giờ',1,'Level 2'),(5,5,'Kỹ sư AI chuyên xây dựng Trợ lý ảo thông minh (AI Agent) và tích hợp các API mô hình lớn như Gemini.',5,34,'Trong vòng 3 giờ',1,'New Seller'),(6,6,'Biên dịch viên có chứng chỉ quốc tế, chuyên dịch thuật tài liệu pháp lý, sách báo Anh - Việt.',4.7,18,'Trong vòng 2 giờ',1,'New Seller'),(7,7,'Editor chuyên nghiệp, nhận dựng video ngắn TikTok, Reels, YouTube và làm hiệu ứng kỹ xảo 2D/3D.',4.6,59,'Trong vòng 4 giờ',1,'Level 1'),(8,8,'Dịch vụ báo cáo tài chính doanh nghiệp, làm sổ sách kế toán thuế trọn gói và tư vấn dòng tiền.',4.9,74,'Trong vòng 1 giờ',1,'Level 2');
/*!40000 ALTER TABLE `sellers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` int NOT NULL,
  `role` enum('ROLE_ADMIN','ROLE_BUYER','ROLE_SELLER') DEFAULT NULL,
  KEY `FKhfh9dx7w3ubf1co1vdev94g3f` (`user_id`),
  CONSTRAINT `FKhfh9dx7w3ubf1co1vdev94g3f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (12,'ROLE_BUYER'),(1,'ROLE_BUYER'),(1,'ROLE_SELLER'),(2,'ROLE_BUYER'),(2,'ROLE_SELLER'),(3,'ROLE_BUYER'),(3,'ROLE_SELLER'),(4,'ROLE_BUYER'),(4,'ROLE_SELLER'),(5,'ROLE_BUYER'),(5,'ROLE_SELLER'),(6,'ROLE_BUYER'),(6,'ROLE_SELLER'),(7,'ROLE_BUYER'),(7,'ROLE_SELLER'),(8,'ROLE_BUYER'),(8,'ROLE_SELLER');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `fullname` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `phone` varchar(255) DEFAULT NULL,
  `roles` json DEFAULT NULL,
  `current_role` enum('ROLE_ADMIN','ROLE_BUYER','ROLE_SELLER') DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `UKdu5v5sr43g5bfnji4vb8hg5s3` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'minh_thuc_dev','Phạm Nguyễn Minh Thức','minhthuc@example.com','https://api.dicebear.com/7.x/avataaars/svg?seed=Thuc','$2a$10$AzR7Z4b.J1YyvRk.p7l7O.VlXp4bW.2/L59m9y9Y9y9Y9y9Y9y9Y9','2026-05-27 19:24:59','0911223344',NULL,'ROLE_SELLER','Vietnam'),(2,'trung_kien_design','Phan Trung Kiên','kienphan@example.com','https://api.dicebear.com/7.x/avataaars/svg?seed=Kien','$2a$10$AzR7Z4b.J1YyvRk.p7l7O.VlXp4bW.2/L59m9y9Y9y9Y9y9Y9y9Y9','2026-05-27 19:24:59','0922334455',NULL,'ROLE_SELLER','Vietnam'),(3,'hoang_nam_seo','Nguyễn Hoàng Nam','namhoang@example.com','https://api.dicebear.com/7.x/avataaars/svg?seed=Nam','$2a$10$AzR7Z4b.J1YyvRk.p7l7O.VlXp4bW.2/L59m9y9Y9y9Y9y9Y9y9Y9','2026-05-27 19:24:59','0933445566',NULL,'ROLE_SELLER','Vietnam'),(4,'thu_ha_voice','Lê Thu Hà','hathu@example.com','https://api.dicebear.com/7.x/avataaars/svg?seed=Ha','$2a$10$AzR7Z4b.J1YyvRk.p7l7O.VlXp4bW.2/L59m9y9Y9y9Y9y9Y9y9Y9','2026-05-27 19:24:59','0944556677',NULL,'ROLE_SELLER','Vietnam'),(5,'quoc_bao_ai','Trần Quốc Bảo','baoquoc@example.com','https://api.dicebear.com/7.x/avataaars/svg?seed=Bao','$2a$10$AzR7Z4b.J1YyvRk.p7l7O.VlXp4bW.2/L59m9y9Y9y9Y9y9Y9y9Y9','2026-05-27 19:24:59','0955667788',NULL,'ROLE_SELLER','Vietnam'),(6,'lan_anh_trans','Đặng Lan Anh','lananh@example.com','https://api.dicebear.com/7.x/avataaars/svg?seed=Anh','$2a$10$AzR7Z4b.J1YyvRk.p7l7O.VlXp4bW.2/L59m9y9Y9y9Y9y9Y9y9Y9','2026-05-27 19:24:59','0966778899',NULL,'ROLE_SELLER','Vietnam'),(7,'duy_manh_video','Vũ Duy Mạnh','manhduy@example.com','https://api.dicebear.com/7.x/avataaars/svg?seed=Manh','$2a$10$AzR7Z4b.J1YyvRk.p7l7O.VlXp4bW.2/L59m9y9Y9y9Y9y9Y9y9Y9','2026-05-27 19:24:59','0977889900',NULL,'ROLE_SELLER','Vietnam'),(8,'ngoc_mai_acc','Trịnh Ngọc Mai','maingoc@example.com','https://api.dicebear.com/7.x/avataaars/svg?seed=Mai','$2a$10$AzR7Z4b.J1YyvRk.p7l7O.VlXp4bW.2/L59m9y9Y9y9Y9y9Y9y9Y9','2026-05-27 19:24:59','0988990011',NULL,'ROLE_SELLER','Vietnam');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallets`
--

DROP TABLE IF EXISTS `wallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `balance` decimal(15,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallets`
--

LOCK TABLES `wallets` WRITE;
/*!40000 ALTER TABLE `wallets` DISABLE KEYS */;
/*!40000 ALTER TABLE `wallets` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-28  2:32:35
