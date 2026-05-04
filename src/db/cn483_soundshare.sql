-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 04, 2026 at 03:57 PM
-- Server version: 8.0.43
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cn483_soundshare`
--

-- --------------------------------------------------------

--
-- Table structure for table `chat_rooms`
--

CREATE TABLE `chat_rooms` (
  `room_id` int NOT NULL,
  `room_name` varchar(20) NOT NULL,
  `room_creator` int NOT NULL,
  `room_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `chat_rooms`
--

INSERT INTO `chat_rooms` (`room_id`, `room_name`, `room_creator`, `room_created`) VALUES
(1, 'test room 1', 1, '2026-04-13 14:49:03'),
(42, 'New Pop Song', 1, '2026-04-14 19:33:44'),
(43, 'User 2 new chat', 2, '2026-04-15 08:15:09'),
(44, 'new song', 8, '2026-04-15 09:22:24'),
(45, 'Chat with admin', 9, '2026-04-15 10:19:49'),
(46, '123', 9, '2026-04-15 17:17:06'),
(47, '3223', 9, '2026-04-15 17:21:27'),
(48, 'Cooba\'s Chat', 10, '2026-05-02 10:32:11'),
(49, 'Chat 2', 10, '2026-05-02 10:34:43'),
(50, 'admin admin', 12, '2026-05-02 20:19:22'),
(51, 'chat_test', 11, '2026-05-02 20:26:05'),
(52, 'test2', 11, '2026-05-02 20:28:59'),
(53, 'admin admin', 12, '2026-05-02 20:42:13'),
(54, 'a chat', 13, '2026-05-02 20:53:53'),
(55, 'admin admin', 14, '2026-05-02 20:54:56'),
(56, 'another chat', 13, '2026-05-02 20:55:33'),
(57, 'admin admin', 14, '2026-05-02 20:58:28'),
(58, 'Test', 14, '2026-05-02 20:59:13'),
(59, 'admin admin', 14, '2026-05-02 21:03:52'),
(60, 'Gimps', 15, '2026-05-02 23:53:33'),
(61, 'Found ur account', 16, '2026-05-02 23:57:54');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `message_id` int NOT NULL,
  `room_id` int NOT NULL,
  `message_sender` int NOT NULL,
  `contents` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `message_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`message_id`, `room_id`, `message_sender`, `contents`, `message_timestamp`) VALUES
(1, 1, 1, 'from user 1', '2026-04-13 14:58:40'),
(2, 1, 2, 'from user 2', '2026-04-13 14:58:40'),
(3, 1, 3, 'from user 3', '2026-04-13 14:58:40'),
(4, 1, 1, '123', '2026-04-13 16:31:33'),
(5, 1, 1, 'hey', '2026-04-13 16:33:02'),
(6, 1, 2, 'user 2 here', '2026-04-13 16:33:43'),
(7, 1, 1, '2', '2026-04-13 16:36:44'),
(8, 1, 1, 'uploads/audio/1776099989_recording.webm', '2026-04-13 17:06:29'),
(9, 1, 1, 'uploads/audio/1776100108_recording.webm', '2026-04-13 17:08:28'),
(10, 1, 1, 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus.', '2026-04-14 13:35:49'),
(11, 1, 3, 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus.', '2026-04-14 13:36:03'),
(19, 42, 1, 'Room created by user 1', '2026-04-14 19:33:44'),
(20, 42, 1, 'hey all', '2026-04-14 19:33:51'),
(21, 42, 3, 'hey', '2026-04-14 19:34:10'),
(22, 42, 2, 'heya', '2026-04-14 19:34:19'),
(23, 43, 2, '**CHAT CREATED BY USER 2**', '2026-04-15 08:15:09'),
(24, 44, 8, '**CHAT CREATED BY USER 8**', '2026-04-15 09:22:24'),
(25, 44, 8, 'hey all', '2026-04-15 09:22:31'),
(26, 44, 8, 'uploads/audio/1776244978_recording.webm', '2026-04-15 09:22:58'),
(27, 44, 8, 'Hey', '2026-04-15 10:18:08'),
(28, 45, 9, '**CHAT CREATED BY USER 9**', '2026-04-15 10:19:49'),
(29, 45, 9, 'Hey there', '2026-04-15 10:19:55'),
(30, 45, 9, 'uploads/audio/1776248409_recording.webm', '2026-04-15 10:20:09'),
(31, 45, 8, 'hey admin 2', '2026-04-15 10:20:45'),
(32, 45, 8, 'Test', '2026-04-15 10:26:53'),
(33, 45, 9, 'Hey', '2026-04-15 10:27:32'),
(34, 45, 9, '123', '2026-04-15 10:28:39'),
(35, 45, 9, 'Test', '2026-04-15 10:30:52'),
(36, 45, 8, 'hey', '2026-04-15 10:33:54'),
(37, 45, 9, 'How are you', '2026-04-15 10:34:09'),
(38, 45, 8, 'good', '2026-04-15 10:34:15'),
(39, 45, 8, 'how is the new song', '2026-04-15 10:35:52'),
(40, 45, 9, 'It’s going well thanks', '2026-04-15 10:36:15'),
(41, 45, 8, 'great!', '2026-04-15 10:36:22'),
(42, 45, 9, 'Cool', '2026-04-15 10:51:10'),
(43, 45, 8, 'good', '2026-04-15 11:04:02'),
(44, 45, 9, 'Hi', '2026-04-15 11:04:11'),
(45, 45, 8, 'uploads/audio/1776251075_recording.webm', '2026-04-15 11:04:35'),
(46, 45, 9, 'Hi', '2026-04-15 11:42:32'),
(47, 45, 9, 'uploads/audio/1776253363_recording.webm', '2026-04-15 11:42:43'),
(48, 46, 9, '**CHAT CREATED BY USER 9**', '2026-04-15 17:17:06'),
(49, 47, 9, '**CHAT CREATED BY USER 9**', '2026-04-15 17:21:27'),
(50, 47, 8, 'uploads/audio/1776358303_recording.webm', '2026-04-16 16:51:43'),
(51, 45, 8, 'Bdhdhs', '2026-04-23 08:28:48'),
(52, 45, 8, 'uploads/audio/1776932940_recording.webm', '2026-04-23 08:29:00'),
(53, 48, 10, '**CHAT CREATED BY USER 10**', '2026-05-02 10:32:11'),
(54, 48, 10, 'Hello', '2026-05-02 10:32:54'),
(55, 48, 10, 'uploads/audio/1777718024_recording.webm', '2026-05-02 10:33:44'),
(56, 49, 10, '**CHAT CREATED BY USER 10**', '2026-05-02 10:34:43'),
(57, 48, 10, 'ddd', '2026-05-02 10:39:17'),
(58, 48, 7, 'SELECT * FROM users', '2026-05-02 10:43:47'),
(59, 50, 12, '**CHAT CREATED BY USER 12**', '2026-05-02 20:19:22'),
(60, 50, 12, 'Hello', '2026-05-02 20:19:54'),
(61, 51, 11, '**CHAT CREATED BY USER 11**', '2026-05-02 20:26:05'),
(62, 52, 11, '**CHAT CREATED BY USER 11**', '2026-05-02 20:28:59'),
(63, 51, 11, 'hello', '2026-05-02 20:29:19'),
(64, 51, 11, 'uploads/audio/1777753808_recording.webm', '2026-05-02 20:30:08'),
(65, 51, 11, 'uploads/audio/1777753848_recording.webm', '2026-05-02 20:30:48'),
(66, 53, 12, '**CHAT CREATED BY USER 12**', '2026-05-02 20:42:13'),
(67, 50, 12, 'uploads/audio/1777754595_recording.webm', '2026-05-02 20:43:15'),
(68, 50, 12, 'uploads/audio/1777754634_recording.webm', '2026-05-02 20:43:54'),
(69, 50, 12, 'uploads/audio/1777754670_recording.webm', '2026-05-02 20:44:30'),
(70, 50, 12, 'uploads/audio/1777754691_recording.webm', '2026-05-02 20:44:51'),
(71, 53, 12, 'uploads/audio/1777754704_recording.webm', '2026-05-02 20:45:04'),
(72, 50, 12, 'uploads/audio/1777754752_recording.webm', '2026-05-02 20:45:52'),
(73, 50, 12, 'uploads/audio/1777754985_recording.webm', '2026-05-02 20:49:45'),
(74, 50, 12, 'Hello', '2026-05-02 20:49:52'),
(75, 50, 12, 'Hello again', '2026-05-02 20:50:37'),
(76, 50, 12, 'uploads/audio/1777755068_recording.webm', '2026-05-02 20:51:08'),
(77, 54, 13, '**CHAT CREATED BY USER 13**', '2026-05-02 20:53:53'),
(78, 54, 13, 'hello admin', '2026-05-02 20:54:19'),
(79, 55, 14, '**CHAT CREATED BY USER 14**', '2026-05-02 20:54:56'),
(80, 55, 14, 'Hello', '2026-05-02 20:55:09'),
(81, 55, 14, 'uploads/audio/1777755323_recording.webm', '2026-05-02 20:55:23'),
(82, 56, 13, '**CHAT CREATED BY USER 13**', '2026-05-02 20:55:33'),
(83, 55, 14, 'uploads/audio/1777755340_recording.webm', '2026-05-02 20:55:40'),
(84, 55, 14, 'uploads/audio/1777755347_recording.webm', '2026-05-02 20:55:47'),
(85, 55, 14, 'uploads/audio/1777755383_recording.webm', '2026-05-02 20:56:23'),
(86, 55, 14, 'Hello again', '2026-05-02 20:56:45'),
(87, 55, 14, 'uploads/audio/1777755423_recording.webm', '2026-05-02 20:57:03'),
(88, 57, 14, '**CHAT CREATED BY USER 14**', '2026-05-02 20:58:28'),
(89, 57, 14, 'Jdkks', '2026-05-02 20:58:36'),
(90, 57, 14, 'uploads/audio/1777755527_recording.webm', '2026-05-02 20:58:47'),
(91, 58, 14, '**CHAT CREATED BY USER 14**', '2026-05-02 20:59:13'),
(92, 58, 14, 'uploads/audio/1777755586_recording.webm', '2026-05-02 20:59:46'),
(93, 58, 14, 'Hello', '2026-05-02 20:59:59'),
(94, 49, 10, 'uploads/audio/1777755781_recording.webm', '2026-05-02 21:03:01'),
(95, 54, 13, 'uploads/audio/1777755812_recording.webm', '2026-05-02 21:03:32'),
(96, 59, 14, '**CHAT CREATED BY USER 14**', '2026-05-02 21:03:52'),
(97, 59, 14, 'uploads/audio/1777755858_recording.webm', '2026-05-02 21:04:18'),
(98, 60, 15, '**CHAT CREATED BY USER 15**', '2026-05-02 23:53:33'),
(99, 60, 15, 'My name jeff', '2026-05-02 23:53:42'),
(100, 60, 15, 'uploads/audio/1777766052_recording.webm', '2026-05-02 23:54:12'),
(101, 60, 15, 'uploads/audio/1777766071_recording.webm', '2026-05-02 23:54:31'),
(102, 61, 16, '**CHAT CREATED BY USER 16**', '2026-05-02 23:57:54'),
(103, 61, 16, 'I’ve found all ur family’s accounts gna flirt with ur dad', '2026-05-02 23:58:23');

-- --------------------------------------------------------

--
-- Table structure for table `room_members`
--

CREATE TABLE `room_members` (
  `room_id` int NOT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `room_members`
--

INSERT INTO `room_members` (`room_id`, `user_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(42, 1),
(42, 2),
(42, 3),
(43, 1),
(43, 2),
(44, 2),
(44, 3),
(44, 7),
(44, 8),
(45, 8),
(45, 9),
(46, 3),
(46, 8),
(46, 9),
(47, 7),
(47, 8),
(47, 9),
(48, 1),
(48, 7),
(48, 8),
(48, 10),
(49, 1),
(49, 2),
(49, 10),
(50, 8),
(50, 12),
(51, 6),
(51, 8),
(51, 9),
(51, 11),
(52, 2),
(52, 11),
(53, 1),
(53, 2),
(53, 12),
(54, 8),
(54, 13),
(55, 1),
(55, 2),
(55, 14),
(56, 1),
(56, 3),
(56, 8),
(56, 9),
(56, 13),
(57, 3),
(57, 8),
(57, 14),
(58, 12),
(58, 14),
(59, 3),
(59, 14),
(60, 1),
(60, 15),
(61, 10),
(61, 16);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `fname` varchar(255) NOT NULL,
  `lname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `fname`, `lname`, `email`, `password`) VALUES
(1, 'test user', '1', 'test1@email.com', ''),
(2, 'test user', '2', 'test2@email.com', ''),
(3, 'test user', '3', 'tu3@email.com', ''),
(6, 'test', '4', 'test4@email.com', ''),
(7, '5', 'user', '5use@email.com', '$2y$10$3YcD6NkhpUIqHnCwRMe8kOKmRIjNob1O6AqbWjb4NEgBi/zDj9/c2'),
(8, 'admin', 'admin', 'admin@admin.com', '$2y$10$TrUbxn15x4.fSqcFWmBz3uwMLMDVH93cxdbbCQ63Sz7QFm96P0.Ma'),
(9, 'Admin2', 'User', 'admin2@admin.com', '$2y$10$gtrrXkcD1suEqJbXw2D/B.KKDBjT69JpwMJAZGcEwVCnB2bzqsqJS'),
(10, 'Cooba', 'North', 'coobanorth@gmail.com', '$2y$10$RlvZrMtpKz4WhpToXOekF.B9xBejH0E/CPlmQHnUAVPqzmynG/k/W'),
(11, 'mallee', 'north', 'malleenorth@gmail.com', '$2y$10$qgKUdtuDpY8j/hLu/Crw7u4UwhAgoXyMaAlGH2a1FoHcPOftJJ8Iq'),
(12, 'Katishe', 'North', 'katishe_n@yahoo.com', '$2y$10$XrCLz4mHXg5NYjPhqrgo6.fKJlmB3wnlXYGeeFXe335EGl0DDo6Ga'),
(13, 'Andy', 'North', 'andynorth3@gmail.com', '$2y$10$8576KR8WVMya1Z7LtQc5we2KkrlWRoLaRXuhwmvJAxAbV143hXwNK'),
(14, 'Théo', 'Kerriou', 'theo.francis.kerriou@icloud.com', '$2y$10$DKV8MxfOr7BW3HHXcRz3i./PMfXSy.ALjVQfIYdj5MIBNuj8adgA.'),
(15, 'James', 'Foy', 'james.foy3110@gmail.com', '$2y$10$MztmXGQjh64NRuvwj5g51OI91sM1Y5KG9lgfaXEoYIb7IuTNb9I1O'),
(16, 'Ben', 'Dover', 'gay@gmail.com', '$2y$10$9WftzQyxR6r2VgfTsQVeNOvTvoEoNo3ooggbYbGM79f4huQYK5yzO');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chat_rooms`
--
ALTER TABLE `chat_rooms`
  ADD PRIMARY KEY (`room_id`),
  ADD KEY `CREATOR` (`room_creator`) USING BTREE;

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`) USING BTREE,
  ADD KEY `SENDER` (`room_id`) USING BTREE,
  ADD KEY `RECEIVER` (`message_sender`) USING BTREE;

--
-- Indexes for table `room_members`
--
ALTER TABLE `room_members`
  ADD PRIMARY KEY (`room_id`,`user_id`),
  ADD KEY `ROOM ID` (`room_id`) USING BTREE,
  ADD KEY `user_id` (`user_id`) USING BTREE;

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chat_rooms`
--
ALTER TABLE `chat_rooms`
  MODIFY `room_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chat_rooms`
--
ALTER TABLE `chat_rooms`
  ADD CONSTRAINT `chat_rooms_ibfk_1` FOREIGN KEY (`room_creator`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`message_sender`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`room_id`);

--
-- Constraints for table `room_members`
--
ALTER TABLE `room_members`
  ADD CONSTRAINT `room_members_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`room_id`),
  ADD CONSTRAINT `room_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
