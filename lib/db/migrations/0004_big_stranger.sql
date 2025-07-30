CREATE TABLE `bookings_tables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`table_id` varchar(10) NOT NULL,
	`customer_name` varchar(255),
	`advance_paid` decimal(10,2) DEFAULT '0.00',
	`booked_by_user_id` varchar(10) NOT NULL,
	`reservation_start` date NOT NULL,
	`reservation_end` date NOT NULL,
	`booking_date` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookings_tables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bookings_tables` ADD CONSTRAINT `bookings_tables_table_id_restaurant_tables_id_fk` FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings_tables` ADD CONSTRAINT `bookings_tables_booked_by_user_id_users_id_fk` FOREIGN KEY (`booked_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;