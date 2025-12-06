-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: tech_website
-- ------------------------------------------------------
-- Server version	8.0.44-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL COMMENT '用户ID',
  `action` varchar(50) NOT NULL COMMENT '操作类型',
  `resource_type` varchar(50) NOT NULL COMMENT '资源类型',
  `resource_id` int DEFAULT NULL COMMENT '资源ID',
  `description` text COMMENT '操作描述',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` text COMMENT '用户代理',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `session_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='活动日志表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,1,'logout','auth',NULL,'用户 admin logout auth','192.168.2.102','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-24 01:53:17',NULL),(2,1,'login','auth',NULL,'用户 admin 登录系统','192.168.2.102','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-24 01:53:22',NULL),(3,1,'update','settings',NULL,'用户 admin update settings','192.168.2.102','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-24 01:57:28',NULL),(4,1,'update','settings',NULL,'用户 admin update settings','192.168.2.102','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-24 01:57:49',NULL),(5,1,'create','page',NULL,'用户 admin create page','192.168.2.102','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-24 02:05:29',NULL),(6,NULL,'view','page',1,'访问页面: 首页（必须）','::ffff:127.0.0.1','node','2025-11-24 02:05:31',NULL),(7,NULL,'view','page',1,'访问页面: 首页（必须）','192.168.2.102','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-24 02:08:30',NULL),(8,NULL,'view','page',1,'访问页面: 首页（必须）','192.168.2.102','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-24 02:08:30',NULL),(9,NULL,'view','page',1,'访问页面: 首页（必须）','::ffff:127.0.0.1','node','2025-11-24 02:08:30',NULL),(10,NULL,'view','page',1,'访问页面: 首页（必须）','10.2.1.56','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-24 02:13:07',NULL),(11,NULL,'view','page',1,'访问页面: 首页（必须）','192.168.2.102','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-24 02:14:07',NULL),(12,NULL,'view','page',1,'访问页面: 首页（必须）','192.168.2.102','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-24 02:20:23',NULL),(13,NULL,'view','page',1,'访问页面: 首页（必须）','192.168.2.102','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-24 04:23:13',NULL),(14,NULL,'view','page',1,'访问页面: 首页（必须）','192.168.2.102','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-24 04:36:49',NULL),(15,NULL,'view','page',1,'访问页面: 首页（必须）','192.168.2.102','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-24 04:45:34',NULL),(16,1,'update','page',1,'用户 admin update page','192.168.2.102','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-24 04:48:22',NULL);
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `component_blocks`
--

DROP TABLE IF EXISTS `component_blocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `component_blocks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `page_id` int NOT NULL,
  `component_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `component_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `component_props` json NOT NULL,
  `sort_order` int DEFAULT '0',
  `is_published` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `svg_paths` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_page_id` (`page_id`),
  KEY `idx_component_type` (`component_type`),
  KEY `idx_sort_order` (`sort_order`),
  CONSTRAINT `component_blocks_ibfk_1` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `component_blocks`
--

LOCK TABLES `component_blocks` WRITE;
/*!40000 ALTER TABLE `component_blocks` DISABLE KEYS */;
INSERT INTO `component_blocks` VALUES (24,1,'comp_su2xs7fg8','hero','{\"title\": \"欢迎来到我们的网站\", \"subtitle\": \"为您提供最优质的服务和产品\", \"buttonLink\": \"#\", \"buttonText\": \"了解更多\", \"widthOption\": \"full\", \"backgroundImage\": \"/system-default/images/case_banner.png\", \"backgroundColorOption\": \"default\"}',0,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(25,1,'comp_2c2lmy0eq','image-block','{\"alt\": \"图片描述\", \"src\": \"/system-default/images/solution_digital.png\", \"width\": \"100%\", \"height\": \"auto\", \"caption\": \"\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}',1,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(26,1,'comp_hugun3hg7','banner-carousel','{\"title\": \"欢迎来到我们的网站\", \"slides\": [{\"image\": \"/images/banners/banner1.jpg\", \"title\": \"创新技术解决方案\", \"buttonLink\": \"/services\", \"buttonText\": \"了解更多\", \"description\": \"我们提供最先进的技术解决方案\", \"overlayPosition\": \"center\", \"backgroundColorOption\": \"default\"}, {\"image\": \"/images/banners/banner2.jpg\", \"title\": \"专业服务团队\", \"buttonLink\": \"/contact\", \"buttonText\": \"联系我们\", \"description\": \"经验丰富的专业团队为您提供支持\", \"overlayPosition\": \"bottom-left\"}], \"autoPlay\": true, \"interval\": 5000, \"subtitle\": \"在这里您可以找到我们最新的产品和服务\", \"showArrows\": true, \"widthOption\": \"full\", \"showIndicators\": true, \"backgroundColorOption\": \"default\"}',2,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(27,1,'comp_upf6key5c','logo-wall','{\"logos\": [{\"alt\": \"pig.svg\", \"image\": \"/system-default/react-icons/categories/Animals/pig.svg\"}, {\"alt\": \"spider.svg\", \"image\": \"/system-default/react-icons/categories/Animals/spider.svg\"}, {\"alt\": \"dog.svg\", \"image\": \"/system-default/react-icons/categories/Animals/dog.svg\"}, {\"alt\": \"fish-bone.svg\", \"image\": \"/system-default/react-icons/categories/Animals/fish-bone.svg\"}, {\"alt\": \"fish-off.svg\", \"image\": \"/system-default/react-icons/categories/Animals/fish-off.svg\"}, {\"alt\": \"fish.svg\", \"image\": \"/system-default/react-icons/categories/Animals/fish.svg\"}, {\"alt\": \"pig-money.svg\", \"image\": \"/system-default/react-icons/categories/Animals/pig-money.svg\"}, {\"alt\": \"pig-off.svg\", \"image\": \"/system-default/react-icons/categories/Animals/pig-off.svg\"}], \"shape\": \"square\", \"title\": \"合作伙伴\", \"subtitle\": \"我们与众多知名企业建立了合作关系\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}',3,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(28,1,'comp_o1hp4hr0s','logo-scroll','{\"logos\": [{\"alt\": \"brand-zhihu.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-zhihu.svg\"}, {\"alt\": \"brand-zoom.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-zoom.svg\"}, {\"alt\": \"brand-zulip.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-zulip.svg\"}, {\"alt\": \"brand-zwift.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-zwift.svg\"}, {\"alt\": \"brand-zapier.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-zapier.svg\"}, {\"alt\": \"brand-zalando.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-zalando.svg\"}, {\"alt\": \"brand-youtube.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-youtube.svg\"}, {\"alt\": \"brand-youtube-kids.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-youtube-kids.svg\"}, {\"alt\": \"brand-zeit.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-zeit.svg\"}, {\"alt\": \"brand-yahoo.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-yahoo.svg\"}, {\"alt\": \"brand-yandex.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-yandex.svg\"}, {\"alt\": \"brand-yarn.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-yarn.svg\"}, {\"alt\": \"brand-xamarin.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-xamarin.svg\"}, {\"alt\": \"brand-x.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-x.svg\"}, {\"alt\": \"brand-ycombinator.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-ycombinator.svg\"}, {\"alt\": \"brand-yatse.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-yatse.svg\"}], \"title\": \"合作伙伴\", \"height\": \"high\", \"subtitle\": \"值得信赖的合作伙伴网络\", \"scrollSpeed\": \"slow\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}',4,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(29,1,'comp_ehtj6ex8i','image-text','{\"image\": \"/system-default/images/solution_security.png\", \"title\": \"标题\", \"layout\": \"image-top\", \"description\": \"这是一段描述文字，用来展示图文组件的内容。\", \"widthOption\": \"full\", \"imagePosition\": \"center\", \"backgroundColorOption\": \"default\"}',5,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(30,1,'comp_sgviamia7','image-text-horizontal','{\"image\": \"/system-default/images/solution_infrastructure.png\", \"title\": \"标题\", \"description\": \"这是一段描述文字，用来展示图文组件的内容。\", \"widthOption\": \"full\", \"imagePosition\": \"left\", \"backgroundColorOption\": \"default\"}',6,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(31,1,'comp_jpkhn7u50','feature-grid','{\"title\": \"核心功能\", \"features\": [{\"icon\": \"/system-default/react-icons/categories/Currencies/currency-taka.svg\", \"link\": \"\", \"title\": \"功能一\", \"description\": \"功能一的详细描述\"}, {\"icon\": \"/system-default/react-icons/categories/Currencies/currency-won.svg\", \"link\": \"\", \"title\": \"功能二\", \"description\": \"功能二的详细描述\"}, {\"icon\": \"/system-default/react-icons/categories/Currencies/currency-won.svg\", \"link\": \"\", \"title\": \"功能三\", \"description\": \"功能三的详细描述\"}], \"subtitle\": \"我们提供的主要功能和服务\", \"iconColor\": \"#f97316\", \"cardsPerRow\": 3, \"widthOption\": \"full\", \"iconColorMode\": \"custom\", \"backgroundColorOption\": \"default\"}',7,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(32,1,'comp_9jaqp7j65','feature-grid-large','{\"title\": \"核心功能\", \"features\": [{\"icon\": \"/system-default/react-icons/categories/Design/vector-triangle-off.svg\", \"link\": \"\", \"title\": \"功能一\", \"description\": \"功能一的详细描述\", \"backgroundColorOption\": \"default\"}, {\"icon\": \"/system-default/react-icons/categories/Design/vector-off.svg\", \"link\": \"\", \"title\": \"功能二\", \"description\": \"功能二的详细描述\"}, {\"icon\": \"/system-default/react-icons/categories/Design/tools.svg\", \"link\": \"\", \"title\": \"功能三\", \"description\": \"功能三的详细描述\"}], \"subtitle\": \"我们提供的主要功能和服务\", \"iconColor\": \"#f43f5e\", \"cardsPerRow\": 3, \"widthOption\": \"full\", \"iconColorMode\": \"custom\", \"backgroundColorOption\": \"default\"}',8,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(33,1,'comp_1bupawpuk','pricing-cards','{\"plans\": [{\"name\": \"基础版\", \"price\": \"99\", \"period\": \"每月\", \"features\": [\"功能A\", \"功能B\", \"基础支持\"], \"recommended\": false, \"backgroundColorOption\": \"default\"}, {\"name\": \"专业版\", \"price\": \"199\", \"period\": \"每月\", \"features\": [\"包含基础版\", \"高级功能C\", \"优先支持\"], \"recommended\": true}, {\"link\": \"#\", \"name\": \"基础版\", \"price\": \"99\", \"period\": \"月\", \"features\": [\"功能1\", \"功能2\"], \"recommended\": false}], \"title\": \"价格方案\", \"subtitle\": \"选择最适合您的方案\", \"cardsPerRow\": 3, \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}',9,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(34,1,'comp_440qfmfqd','team-grid','{\"title\": \"我们的团队\", \"members\": [{\"bio\": \"简短介绍CEO的背景和经验\", \"name\": \"CEO姓名\", \"role\": \"首席执行官\", \"avatar\": \"/system-default/react-icons/categories/Design/vector-triangle-off.svg\", \"backgroundColorOption\": \"default\"}, {\"bio\": \"简短介绍CTO的背景和经验\", \"name\": \"CTO姓名\", \"role\": \"首席技术官\", \"avatar\": \"/system-default/react-icons/categories/Design/vector-triangle.svg\"}, {\"bio\": \"个人简介\", \"name\": \"成员姓名\", \"role\": \"职位\", \"avatar\": \"/system-default/react-icons/categories/Design/tools.svg\"}, {\"bio\": \"个人简介\", \"name\": \"成员姓名\", \"role\": \"职位\", \"avatar\": \"/system-default/react-icons/categories/Design/vector-spline.svg\"}], \"subtitle\": \"认识我们的专业团队\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}',10,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(35,1,'comp_o250er1nl','stats-section','{\"stats\": [{\"icon\": \"/system-default/react-icons/categories/Design/template-off.svg\", \"label\": \"满意的客户\", \"value\": \"10,000+\", \"backgroundColorOption\": \"default\"}, {\"icon\": \"/system-default/react-icons/categories/Design/template-off.svg\", \"label\": \"完成项目\", \"value\": \"500+\"}, {\"icon\": \"/system-default/react-icons/categories/Design/vector.svg\", \"label\": \"服务年限\", \"value\": \"8年\"}, {\"icon\": \"/system-default/react-icons/categories/Design/vector-bezier-circle.svg\", \"label\": \"团队规模\", \"value\": \"50+\"}], \"title\": \"我们的成就\", \"subtitle\": \"数字说明一切\", \"iconColor\": \"#6366f1\", \"widthOption\": \"full\", \"iconColorMode\": \"custom\", \"backgroundColorOption\": \"default\"}',11,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(36,1,'comp_2uyhtnqd9','timeline','{\"title\": \"发展历程\", \"events\": [{\"date\": \"2018年\", \"icon\": \"/system-default/react-icons/categories/Devices/wash-machine.svg\", \"title\": \"公司成立\", \"description\": \"在市中心成立，开始第一个项目\", \"backgroundColorOption\": \"default\"}, {\"date\": \"2021年\", \"icon\": \"/system-default/react-icons/categories/Devices/wifi-off.svg\", \"title\": \"业务扩展\", \"description\": \"团队扩大到50人，服务范围覆盖全国\"}, {\"date\": \"2022年\", \"icon\": \"/system-default/react-icons/categories/Devices/viewport-narrow.svg\", \"title\": \"技术突破\", \"description\": \"推出革命性产品，获得多项专利\"}, {\"date\": \"2023年\", \"icon\": \"/system-default/react-icons/categories/Devices/signal-5g.svg\", \"title\": \"国际化\", \"description\": \"业务拓展到海外市场，成为行业领导者\"}], \"subtitle\": \"我们的成长轨迹\", \"iconColor\": \"#10b981\", \"widthOption\": \"full\", \"iconColorMode\": \"custom\", \"backgroundColorOption\": \"default\"}',12,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(37,1,'comp_f04fhaj1c','testimonials','{\"title\": \"客户评价\", \"subtitle\": \"听听客户怎么说\", \"widthOption\": \"full\", \"testimonials\": [{\"name\": \"张三\", \"role\": \"CEO, ABC公司\", \"avatar\": \"/system-default/react-icons/categories/Devices/wifi.svg\", \"rating\": 5, \"content\": \"非常专业的团队，他们的服务质量超过了我们的期望。项目交付及时，效果出色。\", \"backgroundColorOption\": \"default\"}, {\"name\": \"李四\", \"role\": \"CTO, XYZ科技\", \"avatar\": \"/system-default/react-icons/categories/Devices/vinyl.svg\", \"rating\": 5, \"content\": \"合作很愉快，技术实力强。他们能够理解我们的需求并提供创新的解决方案。\"}, {\"name\": \"王五\", \"role\": \"产品经理, DEF集团\", \"avatar\": \"/system-default/react-icons/categories/Devices/wash-machine.svg\", \"rating\": 4, \"content\": \"从项目开始到结束，整个流程非常透明。团队响应迅速，问题解决能力强。\"}], \"backgroundColorOption\": \"default\"}',13,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(38,1,'comp_kzsly84ku','news-list','{\"title\": \"最新动态\", \"articles\": [{\"date\": \"2024-01-15\", \"link\": \"/news/award-2024\", \"image\": \"/system-default/react-icons/categories/Extensions/zip.svg\", \"title\": \"公司获得重要奖项\", \"excerpt\": \"在行业大会上，我们获得了\\\"最佳创新企业\\\"奖项...\", \"summary\": \"在行业大会上，我们获得了\\\"最佳创新企业\\\"奖项...\", \"backgroundColorOption\": \"default\"}, {\"date\": \"2024-01-10\", \"link\": \"/news/product-launch\", \"image\": \"/system-default/react-icons/categories/Extensions/jpg.svg\", \"title\": \"新产品发布会\", \"excerpt\": \"我们将于下月举办新产品发布会，欢迎关注...\", \"summary\": \"我们将于下月举办新产品发布会，欢迎关注...\"}, {\"date\": \"2024-01-05\", \"link\": \"/news/case-study\", \"image\": \"/system-default/react-icons/categories/Extensions/json.svg\", \"title\": \"客户成功案例分享\", \"excerpt\": \"分享一个成功的客户案例，看看我们如何帮助他们...\", \"summary\": \"分享一个成功的客户案例，看看我们如何帮助他们...\"}], \"subtitle\": \"了解我们的最新消息\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}',14,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(39,1,'comp_q4zz51pzi','text-block','{\"title\": \"区块标题\", \"content\": \"这里是文本内容..<br>\\n额分分热舞\", \"alignment\": \"left\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}',15,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(40,1,'comp_r9rvvfmid','contact-form','{\"title\": \"联系我们\", \"fields\": [{\"name\": \"name\", \"type\": \"text\", \"label\": \"姓名\", \"required\": true, \"backgroundColorOption\": \"default\"}, {\"name\": \"email\", \"type\": \"email\", \"label\": \"邮箱\", \"required\": true}, {\"name\": \"message\", \"type\": \"textarea\", \"label\": \"留言\", \"required\": true}], \"subtitle\": \"我们很乐意听到您的声音\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}',16,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(41,1,'comp_eh3t50ixd','call-to-action','{\"title\": \"立即开始使用\", \"subtitle\": \"现在注册可享受30天免费试用\", \"buttonLink\": \"/signup\", \"buttonText\": \"立即注册\", \"widthOption\": \"full\", \"backgroundColor\": \"#3B82F6\", \"backgroundColorOption\": \"default\"}',17,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(42,1,'comp_547sz6xth','faq-section','{\"faqs\": [{\"answer\": \"您可以通过注册账户，然后按照指引进行操作。我们提供详细的使用教程和在线客服支持。\", \"question\": \"这个产品如何使用？\", \"backgroundColorOption\": \"default\"}, {\"answer\": \"我们根据您选择的功能和服务级别来定价。所有价格都是透明的，没有隐藏费用。\", \"question\": \"价格是如何定的？\", \"backgroundColorOption\": \"default\"}, {\"answer\": \"是的，我们提供30天的免费试用期，您可以在试用期内体验所有功能。\", \"question\": \"是否支持免费试用？\", \"backgroundColorOption\": \"default\"}], \"title\": \"常见问题\", \"subtitle\": \"找到您关心问题的答案\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}',18,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(43,1,'comp_qxjmeqeif','link-block','{\"links\": [{\"url\": \"https://example.com\", \"text\": \"官方网站\"}, {\"url\": \"https://docs.example.com\", \"text\": \"产品文档\"}, {\"url\": \"https://support.example.com\", \"text\": \"技术支持\"}], \"title\": \"相关链接\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}',19,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(44,1,'comp_nmdq2n1t9','cyber-timeline','{\"title\": \"数据智能应用之路\", \"events\": [{\"date\": \"T0 - T3 个月\", \"link\": \"\", \"tags\": [{\"label\": \"PoC\", \"highlighted\": true}, {\"label\": \"算法底座\", \"highlighted\": true}, {\"label\": \"指标标准\", \"highlighted\": true}], \"phase\": \"Phase 01\", \"title\": \"试验与模型验证\", \"description\": \"聚焦业务目标指标，完成 PoC 与 MVP 验证，明确技术路线与上线范围。\"}, {\"date\": \"T3 - T9 个月\", \"link\": \"\", \"tags\": [{\"label\": \"ERP 接入\"}, {\"label\": \"CRM 共建\", \"highlighted\": true}, {\"label\": \"流程导入\"}], \"phase\": \"Phase 02\", \"title\": \"业务单点落地\", \"description\": \"对接现有业务系统，定义标杆作业流程，建立监控与反馈机制。\"}, {\"date\": \"T9+ 个月\", \"link\": \"\", \"tags\": [{\"label\": \"工程化\"}, {\"label\": \"AIOps\", \"highlighted\": true}, {\"label\": \"持续交付\"}], \"phase\": \"Phase 03\", \"title\": \"全域推广与 AIOps\", \"description\": \"构建设备/数据中枢，形成组件化供给与智能运维闭环，支撑持续上线。\"}], \"subtitle\": \"从试点到全域落地的实际路径\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}',20,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(45,1,'comp_iy6z3td3x','cyber-showcase','{\"controls\": [{\"id\": \"infra\", \"icon\": \"/system-default/react-icons/categories/Health/virus.svg\", \"image\": \"/images/banners/banner1.jpg\", \"label\": \"智能运维\", \"title\": \"IT基础架构服务\", \"iconColor\": \"#38bdf8\", \"description\": \"统一监控边缘/混合架构，覆盖服务器、网络与安全容量规划。\", \"imageDescription\": \"运维大屏展示机房拓扑、实时告警与资源利用率。\"}, {\"id\": \"security\", \"icon\": \"/system-default/react-icons/categories/Health/smoking-no.svg\", \"image\": \"/images/banners/banner2.jpg\", \"label\": \"安全运营\", \"title\": \"网络安全管控\", \"iconColor\": \"#a855f7\", \"description\": \"融合威胁情报、态势感知与自动化响应，为企业构建端到端安全体系。\", \"imageDescription\": \"安全运营中心面板展示威胁检测、阻断与响应流程。\"}, {\"id\": \"service\", \"icon\": \"/system-default/react-icons/categories/Health/sunglasses.svg\", \"image\": \"/images/hero-bg.jpg\", \"label\": \"技术服务\", \"title\": \"全栈技术支持\", \"iconColor\": \"#f97316\", \"description\": \"团队提供咨询、迁移与托管服务，保障业务稳定持续上线。\", \"imageDescription\": \"项目交付看板展示 SLA、服务动作与客户满意度。\"}], \"widthOption\": \"full\", \"imagePosition\": \"right\", \"backgroundColorOption\": \"default\"}',21,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL),(46,1,'comp_izrp0j75p','cyber-super-card','{\"cards\": [{\"id\": \"vision\", \"icon\": \"/system-default/react-icons/categories/Health/thermometer.svg\", \"link\": \"\", \"tags\": [{\"label\": \"LLM 策略\", \"highlighted\": true}, {\"label\": \"推理守卫\"}], \"image\": \"/images/banners/banner1.jpg\", \"title\": \"幻觉控制和优化\", \"iconColor\": \"#0ea5e9\", \"description\": \"通过召回得分设置和应答策略选择，可有效控制 LLM 带来的幻觉影响，守住内容可信度。\"}, {\"id\": \"context\", \"icon\": \"/system-default/react-icons/categories/Health/skull.svg\", \"link\": \"\", \"tags\": [{\"label\": \"安全沙箱\"}, {\"label\": \"动态提示\", \"highlighted\": true}], \"image\": \"/images/banners/banner2.jpg\", \"title\": \"上下文守护\", \"iconColor\": \"#a855f7\", \"description\": \"自动注入安全上下文与审计提示，保障跨业务场景的回答合规，减少人工覆核成本。\"}, {\"id\": \"insight\", \"icon\": \"/system-default/react-icons/categories/Health/hand-sanitizer.svg\", \"link\": \"\", \"tags\": [{\"label\": \"实时监控\"}, {\"label\": \"绿色通道\", \"highlighted\": true}], \"image\": \"/images/hero-bg.jpg\", \"title\": \"智能洞察面板\", \"iconColor\": \"#22d3ee\", \"description\": \"实时监控用户反馈、性能指标与对话热点，异常数据将被高亮并推送治理建议。\"}], \"alignment\": \"left\", \"iconFrame\": true, \"layoutMode\": \"default\", \"visualMode\": \"icon\", \"cardsPerRow\": 3, \"hoverEffect\": true, \"widthOption\": \"full\", \"flowingLight\": true, \"backgroundColorOption\": \"default\"}',22,1,'2025-11-24 04:48:22','2025-11-24 04:48:22',NULL);
/*!40000 ALTER TABLE `component_blocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_submissions`
--

DROP TABLE IF EXISTS `contact_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_submissions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `message` text,
  `source_page` varchar(255) DEFAULT NULL,
  `fields_json` json NOT NULL DEFAULT (json_array()),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `status` enum('new','read') NOT NULL DEFAULT 'new',
  `emailed_at` datetime DEFAULT NULL,
  `email_result` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_status` (`status`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_submissions`
--

LOCK TABLES `contact_submissions` WRITE;
/*!40000 ALTER TABLE `contact_submissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `navigation`
--

DROP TABLE IF EXISTS `navigation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `navigation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `url` varchar(500) NOT NULL,
  `target` varchar(20) DEFAULT '_self',
  `parent_id` int DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `navigation_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `navigation` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `navigation`
--

LOCK TABLES `navigation` WRITE;
/*!40000 ALTER TABLE `navigation` DISABLE KEYS */;
/*!40000 ALTER TABLE `navigation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_settings`
--

DROP TABLE IF EXISTS `notification_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_settings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `type` enum('email') NOT NULL DEFAULT 'email',
  `smtp_host` varchar(255) NOT NULL,
  `smtp_port` smallint unsigned NOT NULL DEFAULT '587',
  `secure` tinyint(1) NOT NULL DEFAULT '0',
  `username` varchar(255) NOT NULL,
  `password_encrypted` varbinary(512) DEFAULT NULL,
  `from_name` varchar(255) DEFAULT NULL,
  `from_email` varchar(255) NOT NULL,
  `default_recipients` json DEFAULT NULL,
  `contact_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `contact_recipients` json DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `test_status` enum('pending','success','failed') DEFAULT 'pending',
  `last_error` text,
  `updated_by` int DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_type` (`type`),
  KEY `idx_updated_by` (`updated_by`),
  CONSTRAINT `fk_notification_settings_user` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_settings`
--

LOCK TABLES `notification_settings` WRITE;
/*!40000 ALTER TABLE `notification_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `page_components`
--

DROP TABLE IF EXISTS `page_components`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_components` (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `page_id` int NOT NULL,
  `component_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `component_data` json NOT NULL,
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `page_id` (`page_id`),
  CONSTRAINT `page_components_ibfk_1` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page_components`
--

LOCK TABLES `page_components` WRITE;
/*!40000 ALTER TABLE `page_components` DISABLE KEYS */;
/*!40000 ALTER TABLE `page_components` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `page_stats`
--

DROP TABLE IF EXISTS `page_stats`;
/*!50001 DROP VIEW IF EXISTS `page_stats`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `page_stats` AS SELECT 
 1 AS `total_pages`,
 1 AS `published_pages`,
 1 AS `draft_pages`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `page_tags`
--

DROP TABLE IF EXISTS `page_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_tags` (
  `page_id` int NOT NULL,
  `tag_id` int NOT NULL,
  PRIMARY KEY (`page_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `page_tags_ibfk_1` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `page_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page_tags`
--

LOCK TABLES `page_tags` WRITE;
/*!40000 ALTER TABLE `page_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `page_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '页面标题',
  `slug` varchar(200) NOT NULL COMMENT 'URL别名',
  `content` longtext NOT NULL COMMENT '页面内容',
  `excerpt` text COMMENT '页面摘要',
  `featured_image` varchar(500) DEFAULT NULL COMMENT '特色图片',
  `meta_title` varchar(200) DEFAULT NULL COMMENT 'SEO标题',
  `meta_description` text COMMENT 'SEO描述',
  `published` tinyint(1) DEFAULT '0' COMMENT '是否发布',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `created_by` int DEFAULT NULL COMMENT '创建者ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `template_data` json DEFAULT NULL COMMENT '模板数据',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `created_by` (`created_by`),
  KEY `idx_slug` (`slug`),
  KEY `idx_published` (`published`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `pages_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='页面表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
INSERT INTO `pages` VALUES (1,'首页（必须）','home','<div class=\"hero-section\" style=\"background-image: url(\'/system-default/images/case_banner.png\')\">\n  <h1>欢迎来到我们的网站</h1>\n  <p class=\"lead\">为您提供最优质的服务和产品</p>\n  <a href=\"#\" class=\"btn btn-primary\">了解更多</a>\n</div>\n\n<div class=\"image-block\">\n  <img src=\"/system-default/images/solution_digital.png\" alt=\"图片描述\" />\n  \n</div>\n\n<div><!-- 未知组件类型: banner-carousel --></div>\n\n<div><!-- 未知组件类型: logo-wall --></div>\n\n<div><!-- 未知组件类型: logo-scroll --></div>\n\n<div><!-- 未知组件类型: image-text --></div>\n\n<div><!-- 未知组件类型: image-text-horizontal --></div>\n\n<div class=\"features-section\">\n  <h2>核心功能</h2>\n  <p class=\"subtitle\">我们提供的主要功能和服务</p>\n  <div class=\"feature-grid\">\n    \n    <div class=\"feature-item\">\n      <h3>/system-default/react-icons/categories/Currencies/currency-taka.svg 功能一</h3>\n      <p>功能一的详细描述</p>\n    </div>\n    <div class=\"feature-item\">\n      <h3>/system-default/react-icons/categories/Currencies/currency-won.svg 功能二</h3>\n      <p>功能二的详细描述</p>\n    </div>\n    <div class=\"feature-item\">\n      <h3>/system-default/react-icons/categories/Currencies/currency-won.svg 功能三</h3>\n      <p>功能三的详细描述</p>\n    </div>\n  </div>\n</div>\n\n<div><!-- 未知组件类型: feature-grid-large --></div>\n\n<div class=\"pricing-section\">\n  <h2>价格方案</h2>\n  <p class=\"subtitle\">选择最适合您的方案</p>\n  <div class=\"pricing-grid\">\n    \n    <div class=\"price-card \">\n      <h3>基础版</h3>\n      <div class=\"price\">¥99/每月</div>\n      <ul>\n        <li>功能A</li><li>功能B</li><li>基础支持</li>\n      </ul>\n    </div>\n    <div class=\"price-card featured\">\n      <h3>专业版</h3>\n      <div class=\"price\">¥199/每月</div>\n      <ul>\n        <li>包含基础版</li><li>高级功能C</li><li>优先支持</li>\n      </ul>\n    </div>\n    <div class=\"price-card \">\n      <h3>基础版</h3>\n      <div class=\"price\">¥99/月</div>\n      <ul>\n        <li>功能1</li><li>功能2</li>\n      </ul>\n    </div>\n  </div>\n</div>\n\n<div class=\"team-section\">\n  <h2>我们的团队</h2>\n  <p class=\"subtitle\">认识我们的专业团队</p>\n  <div class=\"team-grid\">\n    \n    <div class=\"team-member\">\n      <img src=\"/system-default/react-icons/categories/Design/vector-triangle-off.svg\" alt=\"CEO姓名\" />\n      <h3>CEO姓名</h3>\n      <p class=\"role\">首席执行官</p>\n      <p>简短介绍CEO的背景和经验</p>\n    </div>\n    <div class=\"team-member\">\n      <img src=\"/system-default/react-icons/categories/Design/vector-triangle.svg\" alt=\"CTO姓名\" />\n      <h3>CTO姓名</h3>\n      <p class=\"role\">首席技术官</p>\n      <p>简短介绍CTO的背景和经验</p>\n    </div>\n    <div class=\"team-member\">\n      <img src=\"/system-default/react-icons/categories/Design/tools.svg\" alt=\"成员姓名\" />\n      <h3>成员姓名</h3>\n      <p class=\"role\">职位</p>\n      <p>个人简介</p>\n    </div>\n    <div class=\"team-member\">\n      <img src=\"/system-default/react-icons/categories/Design/vector-spline.svg\" alt=\"成员姓名\" />\n      <h3>成员姓名</h3>\n      <p class=\"role\">职位</p>\n      <p>个人简介</p>\n    </div>\n  </div>\n</div>\n\n<div><!-- 未知组件类型: stats-section --></div>\n\n<div><!-- 未知组件类型: timeline --></div>\n\n<div><!-- 未知组件类型: testimonials --></div>\n\n<div><!-- 未知组件类型: news-list --></div>\n\n<div class=\"text-block\">\n  <h2>区块标题</h2>\n  <div class=\"content\">这里是文本内容..<br>\n额分分热舞</div>\n</div>\n\n<div class=\"contact-form-section\">\n  <h2>联系我们</h2>\n  <p class=\"subtitle\">我们很乐意听到您的声音</p>\n  <form class=\"contact-form\">\n    <div class=\"form-group\">\n          <label>姓名 *</label>\n          <input type=\"text\" name=\"name\" required />\n        </div><div class=\"form-group\">\n          <label>邮箱 *</label>\n          <input type=\"email\" name=\"email\" required />\n        </div><div class=\"form-group\">\n          <label>留言 *</label>\n          <textarea name=\"message\" required></textarea>\n        </div>\n    <button type=\"submit\" class=\"btn btn-primary\">发送消息</button>\n  </form>\n</div>\n\n<div class=\"cta-section\" style=\"background-color: #3B82F6\">\n  <h2>立即开始使用</h2>\n  <p>现在注册可享受30天免费试用</p>\n  <a href=\"/signup\" class=\"btn btn-primary\">立即注册</a>\n</div>\n\n<div><!-- 未知组件类型: faq-section --></div>\n\n<div><!-- 未知组件类型: link-block --></div>\n\n<div><!-- 未知组件类型: cyber-timeline --></div>\n\n<div><!-- 未知组件类型: cyber-showcase --></div>\n\n<div><!-- 未知组件类型: cyber-super-card --></div>','',NULL,'','',1,0,1,'2025-11-24 02:05:29','2025-11-24 04:48:22','{\"theme_id\": \"tech-blue\", \"components\": [{\"id\": \"comp_su2xs7fg8\", \"type\": \"hero\", \"props\": {\"title\": \"欢迎来到我们的网站\", \"subtitle\": \"为您提供最优质的服务和产品\", \"buttonLink\": \"#\", \"buttonText\": \"了解更多\", \"widthOption\": \"full\", \"backgroundImage\": \"/system-default/images/case_banner.png\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_2c2lmy0eq\", \"type\": \"image-block\", \"props\": {\"alt\": \"图片描述\", \"src\": \"/system-default/images/solution_digital.png\", \"width\": \"100%\", \"height\": \"auto\", \"caption\": \"\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_hugun3hg7\", \"type\": \"banner-carousel\", \"props\": {\"title\": \"欢迎来到我们的网站\", \"slides\": [{\"image\": \"/images/banners/banner1.jpg\", \"title\": \"创新技术解决方案\", \"buttonLink\": \"/services\", \"buttonText\": \"了解更多\", \"description\": \"我们提供最先进的技术解决方案\", \"overlayPosition\": \"center\", \"backgroundColorOption\": \"default\"}, {\"image\": \"/images/banners/banner2.jpg\", \"title\": \"专业服务团队\", \"buttonLink\": \"/contact\", \"buttonText\": \"联系我们\", \"description\": \"经验丰富的专业团队为您提供支持\", \"overlayPosition\": \"bottom-left\"}], \"autoPlay\": true, \"interval\": 5000, \"subtitle\": \"在这里您可以找到我们最新的产品和服务\", \"showArrows\": true, \"widthOption\": \"full\", \"showIndicators\": true, \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_upf6key5c\", \"type\": \"logo-wall\", \"props\": {\"logos\": [{\"alt\": \"pig.svg\", \"image\": \"/system-default/react-icons/categories/Animals/pig.svg\"}, {\"alt\": \"spider.svg\", \"image\": \"/system-default/react-icons/categories/Animals/spider.svg\"}, {\"alt\": \"dog.svg\", \"image\": \"/system-default/react-icons/categories/Animals/dog.svg\"}, {\"alt\": \"fish-bone.svg\", \"image\": \"/system-default/react-icons/categories/Animals/fish-bone.svg\"}, {\"alt\": \"fish-off.svg\", \"image\": \"/system-default/react-icons/categories/Animals/fish-off.svg\"}, {\"alt\": \"fish.svg\", \"image\": \"/system-default/react-icons/categories/Animals/fish.svg\"}, {\"alt\": \"pig-money.svg\", \"image\": \"/system-default/react-icons/categories/Animals/pig-money.svg\"}, {\"alt\": \"pig-off.svg\", \"image\": \"/system-default/react-icons/categories/Animals/pig-off.svg\"}], \"shape\": \"square\", \"title\": \"合作伙伴\", \"subtitle\": \"我们与众多知名企业建立了合作关系\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_o1hp4hr0s\", \"type\": \"logo-scroll\", \"props\": {\"logos\": [{\"alt\": \"brand-zhihu.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-zhihu.svg\"}, {\"alt\": \"brand-zoom.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-zoom.svg\"}, {\"alt\": \"brand-zulip.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-zulip.svg\"}, {\"alt\": \"brand-zwift.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-zwift.svg\"}, {\"alt\": \"brand-zapier.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-zapier.svg\"}, {\"alt\": \"brand-zalando.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-zalando.svg\"}, {\"alt\": \"brand-youtube.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-youtube.svg\"}, {\"alt\": \"brand-youtube-kids.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-youtube-kids.svg\"}, {\"alt\": \"brand-zeit.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-zeit.svg\"}, {\"alt\": \"brand-yahoo.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-yahoo.svg\"}, {\"alt\": \"brand-yandex.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-yandex.svg\"}, {\"alt\": \"brand-yarn.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-yarn.svg\"}, {\"alt\": \"brand-xamarin.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-xamarin.svg\"}, {\"alt\": \"brand-x.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-x.svg\"}, {\"alt\": \"brand-ycombinator.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-ycombinator.svg\"}, {\"alt\": \"brand-yatse.svg\", \"image\": \"/system-default/react-icons/categories/Brand/brand-yatse.svg\"}], \"title\": \"合作伙伴\", \"height\": \"high\", \"subtitle\": \"值得信赖的合作伙伴网络\", \"scrollSpeed\": \"slow\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_ehtj6ex8i\", \"type\": \"image-text\", \"props\": {\"image\": \"/system-default/images/solution_security.png\", \"title\": \"标题\", \"layout\": \"image-top\", \"description\": \"这是一段描述文字，用来展示图文组件的内容。\", \"widthOption\": \"full\", \"imagePosition\": \"center\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_sgviamia7\", \"type\": \"image-text-horizontal\", \"props\": {\"image\": \"/system-default/images/solution_infrastructure.png\", \"title\": \"标题\", \"description\": \"这是一段描述文字，用来展示图文组件的内容。\", \"widthOption\": \"full\", \"imagePosition\": \"left\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_jpkhn7u50\", \"type\": \"feature-grid\", \"props\": {\"title\": \"核心功能\", \"features\": [{\"icon\": \"/system-default/react-icons/categories/Currencies/currency-taka.svg\", \"link\": \"\", \"title\": \"功能一\", \"description\": \"功能一的详细描述\"}, {\"icon\": \"/system-default/react-icons/categories/Currencies/currency-won.svg\", \"link\": \"\", \"title\": \"功能二\", \"description\": \"功能二的详细描述\"}, {\"icon\": \"/system-default/react-icons/categories/Currencies/currency-won.svg\", \"link\": \"\", \"title\": \"功能三\", \"description\": \"功能三的详细描述\"}], \"subtitle\": \"我们提供的主要功能和服务\", \"iconColor\": \"#f97316\", \"cardsPerRow\": 3, \"widthOption\": \"full\", \"iconColorMode\": \"custom\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_9jaqp7j65\", \"type\": \"feature-grid-large\", \"props\": {\"title\": \"核心功能\", \"features\": [{\"icon\": \"/system-default/react-icons/categories/Design/vector-triangle-off.svg\", \"link\": \"\", \"title\": \"功能一\", \"description\": \"功能一的详细描述\", \"backgroundColorOption\": \"default\"}, {\"icon\": \"/system-default/react-icons/categories/Design/vector-off.svg\", \"link\": \"\", \"title\": \"功能二\", \"description\": \"功能二的详细描述\"}, {\"icon\": \"/system-default/react-icons/categories/Design/tools.svg\", \"link\": \"\", \"title\": \"功能三\", \"description\": \"功能三的详细描述\"}], \"subtitle\": \"我们提供的主要功能和服务\", \"iconColor\": \"#f43f5e\", \"cardsPerRow\": 3, \"widthOption\": \"full\", \"iconColorMode\": \"custom\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_1bupawpuk\", \"type\": \"pricing-cards\", \"props\": {\"plans\": [{\"name\": \"基础版\", \"price\": \"99\", \"period\": \"每月\", \"features\": [\"功能A\", \"功能B\", \"基础支持\"], \"recommended\": false, \"backgroundColorOption\": \"default\"}, {\"name\": \"专业版\", \"price\": \"199\", \"period\": \"每月\", \"features\": [\"包含基础版\", \"高级功能C\", \"优先支持\"], \"recommended\": true}, {\"link\": \"#\", \"name\": \"基础版\", \"price\": \"99\", \"period\": \"月\", \"features\": [\"功能1\", \"功能2\"], \"recommended\": false}], \"title\": \"价格方案\", \"subtitle\": \"选择最适合您的方案\", \"cardsPerRow\": 3, \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_440qfmfqd\", \"type\": \"team-grid\", \"props\": {\"title\": \"我们的团队\", \"members\": [{\"bio\": \"简短介绍CEO的背景和经验\", \"name\": \"CEO姓名\", \"role\": \"首席执行官\", \"avatar\": \"/system-default/react-icons/categories/Design/vector-triangle-off.svg\", \"backgroundColorOption\": \"default\"}, {\"bio\": \"简短介绍CTO的背景和经验\", \"name\": \"CTO姓名\", \"role\": \"首席技术官\", \"avatar\": \"/system-default/react-icons/categories/Design/vector-triangle.svg\"}, {\"bio\": \"个人简介\", \"name\": \"成员姓名\", \"role\": \"职位\", \"avatar\": \"/system-default/react-icons/categories/Design/tools.svg\"}, {\"bio\": \"个人简介\", \"name\": \"成员姓名\", \"role\": \"职位\", \"avatar\": \"/system-default/react-icons/categories/Design/vector-spline.svg\"}], \"subtitle\": \"认识我们的专业团队\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_o250er1nl\", \"type\": \"stats-section\", \"props\": {\"stats\": [{\"icon\": \"/system-default/react-icons/categories/Design/template-off.svg\", \"label\": \"满意的客户\", \"value\": \"10,000+\", \"backgroundColorOption\": \"default\"}, {\"icon\": \"/system-default/react-icons/categories/Design/template-off.svg\", \"label\": \"完成项目\", \"value\": \"500+\"}, {\"icon\": \"/system-default/react-icons/categories/Design/vector.svg\", \"label\": \"服务年限\", \"value\": \"8年\"}, {\"icon\": \"/system-default/react-icons/categories/Design/vector-bezier-circle.svg\", \"label\": \"团队规模\", \"value\": \"50+\"}], \"title\": \"我们的成就\", \"subtitle\": \"数字说明一切\", \"iconColor\": \"#6366f1\", \"widthOption\": \"full\", \"iconColorMode\": \"custom\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_2uyhtnqd9\", \"type\": \"timeline\", \"props\": {\"title\": \"发展历程\", \"events\": [{\"date\": \"2018年\", \"icon\": \"/system-default/react-icons/categories/Devices/wash-machine.svg\", \"title\": \"公司成立\", \"description\": \"在市中心成立，开始第一个项目\", \"backgroundColorOption\": \"default\"}, {\"date\": \"2021年\", \"icon\": \"/system-default/react-icons/categories/Devices/wifi-off.svg\", \"title\": \"业务扩展\", \"description\": \"团队扩大到50人，服务范围覆盖全国\"}, {\"date\": \"2022年\", \"icon\": \"/system-default/react-icons/categories/Devices/viewport-narrow.svg\", \"title\": \"技术突破\", \"description\": \"推出革命性产品，获得多项专利\"}, {\"date\": \"2023年\", \"icon\": \"/system-default/react-icons/categories/Devices/signal-5g.svg\", \"title\": \"国际化\", \"description\": \"业务拓展到海外市场，成为行业领导者\"}], \"subtitle\": \"我们的成长轨迹\", \"iconColor\": \"#10b981\", \"widthOption\": \"full\", \"iconColorMode\": \"custom\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_f04fhaj1c\", \"type\": \"testimonials\", \"props\": {\"title\": \"客户评价\", \"subtitle\": \"听听客户怎么说\", \"widthOption\": \"full\", \"testimonials\": [{\"name\": \"张三\", \"role\": \"CEO, ABC公司\", \"avatar\": \"/system-default/react-icons/categories/Devices/wifi.svg\", \"rating\": 5, \"content\": \"非常专业的团队，他们的服务质量超过了我们的期望。项目交付及时，效果出色。\", \"backgroundColorOption\": \"default\"}, {\"name\": \"李四\", \"role\": \"CTO, XYZ科技\", \"avatar\": \"/system-default/react-icons/categories/Devices/vinyl.svg\", \"rating\": 5, \"content\": \"合作很愉快，技术实力强。他们能够理解我们的需求并提供创新的解决方案。\"}, {\"name\": \"王五\", \"role\": \"产品经理, DEF集团\", \"avatar\": \"/system-default/react-icons/categories/Devices/wash-machine.svg\", \"rating\": 4, \"content\": \"从项目开始到结束，整个流程非常透明。团队响应迅速，问题解决能力强。\"}], \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_kzsly84ku\", \"type\": \"news-list\", \"props\": {\"title\": \"最新动态\", \"articles\": [{\"date\": \"2024-01-15\", \"link\": \"/news/award-2024\", \"image\": \"/system-default/react-icons/categories/Extensions/zip.svg\", \"title\": \"公司获得重要奖项\", \"excerpt\": \"在行业大会上，我们获得了\\\"最佳创新企业\\\"奖项...\", \"summary\": \"在行业大会上，我们获得了\\\"最佳创新企业\\\"奖项...\", \"backgroundColorOption\": \"default\"}, {\"date\": \"2024-01-10\", \"link\": \"/news/product-launch\", \"image\": \"/system-default/react-icons/categories/Extensions/jpg.svg\", \"title\": \"新产品发布会\", \"excerpt\": \"我们将于下月举办新产品发布会，欢迎关注...\", \"summary\": \"我们将于下月举办新产品发布会，欢迎关注...\"}, {\"date\": \"2024-01-05\", \"link\": \"/news/case-study\", \"image\": \"/system-default/react-icons/categories/Extensions/json.svg\", \"title\": \"客户成功案例分享\", \"excerpt\": \"分享一个成功的客户案例，看看我们如何帮助他们...\", \"summary\": \"分享一个成功的客户案例，看看我们如何帮助他们...\"}], \"subtitle\": \"了解我们的最新消息\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_q4zz51pzi\", \"type\": \"text-block\", \"props\": {\"title\": \"区块标题\", \"content\": \"这里是文本内容..<br>\\n额分分热舞\", \"alignment\": \"left\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_r9rvvfmid\", \"type\": \"contact-form\", \"props\": {\"title\": \"联系我们\", \"fields\": [{\"name\": \"name\", \"type\": \"text\", \"label\": \"姓名\", \"required\": true, \"backgroundColorOption\": \"default\"}, {\"name\": \"email\", \"type\": \"email\", \"label\": \"邮箱\", \"required\": true}, {\"name\": \"message\", \"type\": \"textarea\", \"label\": \"留言\", \"required\": true}], \"subtitle\": \"我们很乐意听到您的声音\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_eh3t50ixd\", \"type\": \"call-to-action\", \"props\": {\"title\": \"立即开始使用\", \"subtitle\": \"现在注册可享受30天免费试用\", \"buttonLink\": \"/signup\", \"buttonText\": \"立即注册\", \"widthOption\": \"full\", \"backgroundColor\": \"#3B82F6\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_547sz6xth\", \"type\": \"faq-section\", \"props\": {\"faqs\": [{\"answer\": \"您可以通过注册账户，然后按照指引进行操作。我们提供详细的使用教程和在线客服支持。\", \"question\": \"这个产品如何使用？\", \"backgroundColorOption\": \"default\"}, {\"answer\": \"我们根据您选择的功能和服务级别来定价。所有价格都是透明的，没有隐藏费用。\", \"question\": \"价格是如何定的？\", \"backgroundColorOption\": \"default\"}, {\"answer\": \"是的，我们提供30天的免费试用期，您可以在试用期内体验所有功能。\", \"question\": \"是否支持免费试用？\", \"backgroundColorOption\": \"default\"}], \"title\": \"常见问题\", \"subtitle\": \"找到您关心问题的答案\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_qxjmeqeif\", \"type\": \"link-block\", \"props\": {\"links\": [{\"url\": \"https://example.com\", \"text\": \"官方网站\"}, {\"url\": \"https://docs.example.com\", \"text\": \"产品文档\"}, {\"url\": \"https://support.example.com\", \"text\": \"技术支持\"}], \"title\": \"相关链接\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_nmdq2n1t9\", \"type\": \"cyber-timeline\", \"props\": {\"title\": \"数据智能应用之路\", \"events\": [{\"date\": \"T0 - T3 个月\", \"link\": \"\", \"tags\": [{\"label\": \"PoC\", \"highlighted\": true}, {\"label\": \"算法底座\", \"highlighted\": true}, {\"label\": \"指标标准\", \"highlighted\": true}], \"phase\": \"Phase 01\", \"title\": \"试验与模型验证\", \"description\": \"聚焦业务目标指标，完成 PoC 与 MVP 验证，明确技术路线与上线范围。\"}, {\"date\": \"T3 - T9 个月\", \"link\": \"\", \"tags\": [{\"label\": \"ERP 接入\"}, {\"label\": \"CRM 共建\", \"highlighted\": true}, {\"label\": \"流程导入\"}], \"phase\": \"Phase 02\", \"title\": \"业务单点落地\", \"description\": \"对接现有业务系统，定义标杆作业流程，建立监控与反馈机制。\"}, {\"date\": \"T9+ 个月\", \"link\": \"\", \"tags\": [{\"label\": \"工程化\"}, {\"label\": \"AIOps\", \"highlighted\": true}, {\"label\": \"持续交付\"}], \"phase\": \"Phase 03\", \"title\": \"全域推广与 AIOps\", \"description\": \"构建设备/数据中枢，形成组件化供给与智能运维闭环，支撑持续上线。\"}], \"subtitle\": \"从试点到全域落地的实际路径\", \"widthOption\": \"full\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_iy6z3td3x\", \"type\": \"cyber-showcase\", \"props\": {\"controls\": [{\"id\": \"infra\", \"icon\": \"/system-default/react-icons/categories/Health/virus.svg\", \"image\": \"/images/banners/banner1.jpg\", \"label\": \"智能运维\", \"title\": \"IT基础架构服务\", \"iconColor\": \"#38bdf8\", \"description\": \"统一监控边缘/混合架构，覆盖服务器、网络与安全容量规划。\", \"imageDescription\": \"运维大屏展示机房拓扑、实时告警与资源利用率。\"}, {\"id\": \"security\", \"icon\": \"/system-default/react-icons/categories/Health/smoking-no.svg\", \"image\": \"/images/banners/banner2.jpg\", \"label\": \"安全运营\", \"title\": \"网络安全管控\", \"iconColor\": \"#a855f7\", \"description\": \"融合威胁情报、态势感知与自动化响应，为企业构建端到端安全体系。\", \"imageDescription\": \"安全运营中心面板展示威胁检测、阻断与响应流程。\"}, {\"id\": \"service\", \"icon\": \"/system-default/react-icons/categories/Health/sunglasses.svg\", \"image\": \"/images/hero-bg.jpg\", \"label\": \"技术服务\", \"title\": \"全栈技术支持\", \"iconColor\": \"#f97316\", \"description\": \"团队提供咨询、迁移与托管服务，保障业务稳定持续上线。\", \"imageDescription\": \"项目交付看板展示 SLA、服务动作与客户满意度。\"}], \"widthOption\": \"full\", \"imagePosition\": \"right\", \"backgroundColorOption\": \"default\"}}, {\"id\": \"comp_izrp0j75p\", \"type\": \"cyber-super-card\", \"props\": {\"cards\": [{\"id\": \"vision\", \"icon\": \"/system-default/react-icons/categories/Health/thermometer.svg\", \"link\": \"\", \"tags\": [{\"label\": \"LLM 策略\", \"highlighted\": true}, {\"label\": \"推理守卫\"}], \"image\": \"/images/banners/banner1.jpg\", \"title\": \"幻觉控制和优化\", \"iconColor\": \"#0ea5e9\", \"description\": \"通过召回得分设置和应答策略选择，可有效控制 LLM 带来的幻觉影响，守住内容可信度。\"}, {\"id\": \"context\", \"icon\": \"/system-default/react-icons/categories/Health/skull.svg\", \"link\": \"\", \"tags\": [{\"label\": \"安全沙箱\"}, {\"label\": \"动态提示\", \"highlighted\": true}], \"image\": \"/images/banners/banner2.jpg\", \"title\": \"上下文守护\", \"iconColor\": \"#a855f7\", \"description\": \"自动注入安全上下文与审计提示，保障跨业务场景的回答合规，减少人工覆核成本。\"}, {\"id\": \"insight\", \"icon\": \"/system-default/react-icons/categories/Health/hand-sanitizer.svg\", \"link\": \"\", \"tags\": [{\"label\": \"实时监控\"}, {\"label\": \"绿色通道\", \"highlighted\": true}], \"image\": \"/images/hero-bg.jpg\", \"title\": \"智能洞察面板\", \"iconColor\": \"#22d3ee\", \"description\": \"实时监控用户反馈、性能指标与对话热点，异常数据将被高亮并推送治理建议。\"}], \"alignment\": \"left\", \"iconFrame\": true, \"layoutMode\": \"default\", \"visualMode\": \"icon\", \"cardsPerRow\": 3, \"hoverEffect\": true, \"widthOption\": \"full\", \"flowingLight\": true, \"backgroundColorOption\": \"default\"}}], \"template_id\": null}');
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL COMMENT '设置键',
  `setting_value` longtext COMMENT '设置值',
  `setting_type` enum('string','text','number','boolean','json') DEFAULT 'string' COMMENT '设置类型',
  `description` text COMMENT '设置描述',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `site_theme` varchar(50) DEFAULT 'default',
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`),
  KEY `idx_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=15242 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='设置表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'site_name','元兴信息官网','string','网站名称','2025-08-29 06:53:19','2025-11-24 01:57:49','neo-futuristic'),(2,'site_description','深圳市元兴信息技术有限公司出品','string','网站描述','2025-08-29 06:53:19','2025-11-24 01:57:49','neo-futuristic'),(3,'site_logo','/uploads/images/元兴logo.png','string','网站Logo','2025-08-29 06:53:19','2025-11-24 01:57:49','neo-futuristic'),(4,'site_favicon','/uploads/images/元兴logo.ico','string','网站图标','2025-08-29 06:53:19','2025-11-24 01:57:49','neo-futuristic'),(5,'contact_email','','string','联系邮箱','2025-08-29 06:53:19','2025-11-24 01:57:49','neo-futuristic'),(6,'contact_phone','','string','联系电话','2025-08-29 06:53:19','2025-11-24 01:57:49','neo-futuristic'),(7,'address','','string','公司地址','2025-08-29 06:53:19','2025-11-24 01:57:49','neo-futuristic'),(8,'icp_number','粤ICP备2022044010号-1','string','备案号','2025-08-29 06:53:19','2025-11-24 01:57:49','neo-futuristic'),(9,'social_links','{\"weibo\":\"\",\"wechat\":\"\",\"qq\":\"\",\"email\":\"\"}','json','社交媒体链接','2025-08-29 06:53:19','2025-11-24 01:57:49','neo-futuristic'),(10,'analytics_code','','string','统计代码','2025-08-29 06:53:19','2025-11-24 01:57:49','neo-futuristic'),(13,'company_name','深圳市元兴信息技术有限公司','string','公司名称','2025-08-29 06:55:14','2025-11-24 01:57:49','neo-futuristic'),(844,'nav_layout_style','vertical','string','Navigation layout: horizontal, vertical, centered','2025-09-05 03:21:18','2025-11-21 04:46:44','neo-futuristic'),(1607,'site_theme','minimal-pro','string','网站主题','2025-09-08 00:51:55','2025-11-24 01:57:49','neo-futuristic'),(3093,'wechat_qrcode','','string','微信公众号二维码图片URL','2025-09-11 02:30:58','2025-11-14 10:40:34','default'),(4276,'quick_links','[{\"label\":\"解决方案\",\"href\":\"/pages/jiejuefangan\",\"external\":false}]','json',NULL,'2025-09-28 06:28:44','2025-11-24 01:57:49','default'),(7816,'copyright','Copyright © 2018-2025 深圳市元兴信息技术有限公司. 版权所有.','string','版权声明','2025-10-23 04:29:38','2025-11-24 01:57:49','default'),(10653,'footer_layout','{\"brand\":{\"name\":\"\",\"description\":\"\",\"logo\":\"/uploads/元兴logo.png\"},\"sections\":[]}','json','官网页脚栏目与链接结构','2025-11-14 03:08:10','2025-11-24 01:57:49','default'),(10654,'footer_social_links','[]','json','页脚社交媒体链接','2025-11-14 03:08:10','2025-11-24 01:57:49','default'),(11547,'theme_overrides','{\"accentSaturation\":0.85,\"panelBrightness\":1.2,\"borderRadiusScale\":0.85,\"shadowDepth\":0.9}','json',NULL,'2025-11-15 00:28:51','2025-11-21 04:46:44','default'),(12154,'theme_background','pattern','string',NULL,'2025-11-15 03:04:30','2025-11-24 01:57:49','default'),(12628,'site_statement','Copyright © 2018-2025 深圳市元兴信息技术有限公司. 版权所有.','string',NULL,'2025-11-18 08:00:00','2025-11-24 01:57:49','default'),(12629,'site_record','','string',NULL,'2025-11-18 08:00:00','2025-11-21 04:46:44','default'),(12630,'icp_link','https://beian.miit.gov.cn/','string',NULL,'2025-11-18 08:00:00','2025-11-24 01:57:49','default'),(15001,'site_keywords','深圳市元兴信息技术有限公司出品','string',NULL,'2025-11-22 10:02:59','2025-11-24 01:57:49','default');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (16,'解决方案','jiejuefangan',NULL,'2025-11-19 01:04:12','2025-11-19 01:04:12');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  `start_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `end_time` timestamp NULL DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `user_stats`
--

DROP TABLE IF EXISTS `user_stats`;
/*!50001 DROP VIEW IF EXISTS `user_stats`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `user_stats` AS SELECT 
 1 AS `total_users`,
 1 AS `admin_users`,
 1 AS `editor_users`,
 1 AS `viewer_users`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码哈希',
  `email` varchar(100) NOT NULL COMMENT '邮箱',
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `language` varchar(10) DEFAULT 'zh-CN',
  `role` enum('admin','editor','viewer') DEFAULT 'viewer' COMMENT '用户角色',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `last_login` timestamp NULL DEFAULT NULL COMMENT '最后登录时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2a$12$wncWDj.emZlCZej4ok1tcey3a63Ujq2ZaXadPszC1XlPBXv5Y5AY.','zzb@startpro.com.cn',NULL,NULL,'zh-CN','admin','2025-08-29 06:53:19','2025-11-24 01:53:22','2025-11-24 01:53:22');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visit_stats`
--

DROP TABLE IF EXISTS `visit_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visit_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `visit_date` date NOT NULL,
  `visit_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_date` (`visit_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visit_stats`
--

LOCK TABLES `visit_stats` WRITE;
/*!40000 ALTER TABLE `visit_stats` DISABLE KEYS */;
/*!40000 ALTER TABLE `visit_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `page_stats`
--

/*!50001 DROP VIEW IF EXISTS `page_stats`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `page_stats` AS select count(0) AS `total_pages`,sum((case when (`pages`.`published` = true) then 1 else 0 end)) AS `published_pages`,sum((case when (`pages`.`published` = false) then 1 else 0 end)) AS `draft_pages` from `pages` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `user_stats`
--

/*!50001 DROP VIEW IF EXISTS `user_stats`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `user_stats` AS select count(0) AS `total_users`,sum((case when (`users`.`role` = 'admin') then 1 else 0 end)) AS `admin_users`,sum((case when (`users`.`role` = 'editor') then 1 else 0 end)) AS `editor_users`,sum((case when (`users`.`role` = 'viewer') then 1 else 0 end)) AS `viewer_users` from `users` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24 12:55:40
-- 创建文档中心表
CREATE TABLE IF NOT EXISTS `docs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `parent_id` bigint unsigned DEFAULT NULL,
  `sort_order` int DEFAULT 0,
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `type` enum('doc','folder') NOT NULL DEFAULT 'doc',
  `content` longtext NOT NULL,
  `summary` text,
  `cover` varchar(255) DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `updated_by` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_docs_parent` (`parent_id`),
  KEY `idx_docs_status` (`status`),
  KEY `idx_docs_sort` (`parent_id`,`sort_order`),
  CONSTRAINT `fk_docs_parent` FOREIGN KEY (`parent_id`) REFERENCES `docs`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

