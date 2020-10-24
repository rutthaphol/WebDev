-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 24, 2020 at 03:19 PM
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.2.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hotel`
--

-- --------------------------------------------------------

--
-- Table structure for table `room_desc`
--

CREATE TABLE `room_desc` (
  `ID` int(10) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Adults` int(10) NOT NULL,
  `Children` int(10) NOT NULL,
  `Price` int(10) NOT NULL,
  `Picture` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `room_desc`
--

INSERT INTO `room_desc` (`ID`, `Name`, `Adults`, `Children`, `Price`, `Picture`) VALUES
(1, 'Premium King Room', 3, 0, 159, 'img/room/room-1.jpg'),
(2, 'Premium King Room', 3, 0, 159, 'img/room/room-1.jpg'),
(3, 'Deluxe Room', 2, 0, 159, 'img/room/room-2.jpg'),
(4, 'Deluxe Room', 2, 0, 159, 'img/room/room-2.jpg'),
(5, 'Double Room', 3, 1, 159, 'img/room/room-3.jpg'),
(6, 'Double Room', 3, 1, 159, 'img/room/room-3.jpg'),
(7, 'Luxury Room', 3, 0, 159, 'img/room/room-4.jpg'),
(8, 'Luxury Room', 3, 0, 159, 'img/room/room-4.jpg'),
(9, 'Room With View', 2, 1, 159, 'img/room/room-5.jpg'),
(10, 'Room With View', 2, 1, 159, 'img/room/room-5.jpg'),
(11, 'Small View', 2, 0, 159, 'img/room/room-6.jpg'),
(12, 'Small View', 2, 0, 159, 'img/room/room-6.jpg');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `room_desc`
--
ALTER TABLE `room_desc`
  ADD PRIMARY KEY (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
