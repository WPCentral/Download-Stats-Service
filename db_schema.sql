CREATE TABLE `downloads` (
  `version` varchar(4) NOT NULL DEFAULT '',
  `count` int(8) NOT NULL,
  `date_gmt` datetime NOT NULL,
  KEY `version` (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `releases` (
  `major` varchar(4) NOT NULL DEFAULT '',
  `minor` varchar(2) NOT NULL DEFAULT '',
  `title` varchar(64) NOT NULL DEFAULT '',
  `link` varchar(128) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `version_data` (
  `version` varchar(5) NOT NULL DEFAULT '',
  `name` varchar(16) NOT NULL DEFAULT '',
  `name_long` varchar(64) NOT NULL DEFAULT '',
  `time_start` datetime NOT NULL,
  `time_end` datetime DEFAULT NULL,
  `features` text NOT NULL,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `versions` (
  `type` varchar(16) NOT NULL DEFAULT '',
  `version` varchar(8) NOT NULL DEFAULT '',
  `count` decimal(10,1) NOT NULL,
  `day` date NOT NULL,
  UNIQUE KEY `key` (`type`,`version`,`day`),
  KEY `type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;