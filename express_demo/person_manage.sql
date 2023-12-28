/*
 Navicat Premium Data Transfer

 Source Server         : lss
 Source Server Type    : MySQL
 Source Server Version : 80020
 Source Host           : localhost:3306
 Source Schema         : person_manage

 Target Server Type    : MySQL
 Target Server Version : 80020
 File Encoding         : 65001

 Date: 12/09/2021 19:39:32
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for people_table
-- ----------------------------
DROP TABLE IF EXISTS `people_table`;
CREATE TABLE `people_table`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '一条数据的唯一标识',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '名字字段',
  `age` int(0) NULL DEFAULT NULL COMMENT '年龄字段',
  `home` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '家乡字段',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注字段',
  `is_delete_status` int(0) NULL DEFAULT 1 COMMENT '逻辑删除字段，1代表为删除，0代表已删除',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 19 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of people_table
-- ----------------------------
INSERT INTO `people_table` VALUES (1, '孙悟空', 500, '花果山', '斗战胜佛', 1);
INSERT INTO `people_table` VALUES (2, '猪八戒', 888, '高老庄', '天蓬元帅', 1);
INSERT INTO `people_table` VALUES (3, '沙和尚', 100, '通天河', '卷帘大将', 1);
INSERT INTO `people_table` VALUES (4, '唐僧', 22, '东土大唐', '金蝉子', 1);
INSERT INTO `people_table` VALUES (28, '蜡笔小新', 8, '动画片', '很萌很萌', 1);
INSERT INTO `people_table` VALUES (29, '二郎神', 22, '天庭', '有个宠物狗叫做哮天犬', 1);
INSERT INTO `people_table` VALUES (30, '唐三', 21, '斗罗大陆', '海神唐三666', 1);
INSERT INTO `people_table` VALUES (31, '萧炎厉害啊', 22, '斗气大陆', '炎帝萧炎，异火大佬', 0);
INSERT INTO `people_table` VALUES (32, '萧炎，异火大佬', 22, '斗气大陆', '炎帝萧炎', 1);

SET FOREIGN_KEY_CHECKS = 1;
