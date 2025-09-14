CREATE TABLE `modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`label` varchar(255),
	CONSTRAINT `modules_id` PRIMARY KEY(`id`),
	CONSTRAINT `modules_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role_id` int,
	`module_id` int,
	`label` varchar(255),
	`can_view` boolean DEFAULT false,
	`can_edit` boolean DEFAULT false,
	`can_create` boolean DEFAULT false,
	`can_delete` boolean DEFAULT false,
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role` varchar(255) NOT NULL,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_role_unique` UNIQUE(`role`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`email` varchar(255) NOT NULL,
	`password` varchar(50) NOT NULL,
	`is_active` boolean DEFAULT false,
	`role_id` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `invoices_table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`generated_by_user_id` int NOT NULL,
	`customer_name` varchar(255) NOT NULL DEFAULT 'random',
	`sub_total_amount` decimal(10,2) NOT NULL,
	`discount_percentage` decimal(10,2) NOT NULL DEFAULT '0.00',
	`total_amount` decimal(10,2) NOT NULL,
	`advance_paid` decimal(10,2) DEFAULT '0.00',
	`grand_total` decimal(10,2) NOT NULL DEFAULT '0.00',
	`payment_method` enum('cash','card','online'),
	`is_paid` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoices_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings_tables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`table_id` int NOT NULL,
	`customer_name` varchar(255) NOT NULL,
	`advance_paid` decimal(10,2) DEFAULT '0.00',
	`booked_by_user_id` int NOT NULL,
	`status` enum('scheduled','booked','completed','expired','processing','cancelled') NOT NULL DEFAULT 'scheduled',
	`reservation_start` datetime NOT NULL,
	`reservation_end` datetime NOT NULL,
	`booking_date` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookings_tables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(255),
	CONSTRAINT `menu_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_item_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`menu_item_id` int NOT NULL,
	`option_name` varchar(255),
	`price` decimal(10,2) NOT NULL,
	CONSTRAINT `menu_item_options_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`image` text,
	`category_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(255),
	`price` decimal(10,2) NOT NULL,
	`is_available` boolean DEFAULT true,
	CONSTRAINT `menu_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items_table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`menu_item_image` text,
	`order_id` int NOT NULL,
	`menu_item_id` int,
	`menu_item_name` varchar(255) NOT NULL,
	`menu_item_option_id` int,
	`menu_item_option_name` varchar(255),
	`quantity` int NOT NULL DEFAULT 1,
	`price` decimal(10,2) NOT NULL,
	CONSTRAINT `order_items_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders_table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`table_id` int,
	`waiter_id` int,
	`order_type` enum('dine_in','drive_thru','takeaway') NOT NULL,
	`status` enum('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
	`description` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurant_tables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`table_number` varchar(50) NOT NULL,
	`status` enum('booked','occupied','available') NOT NULL DEFAULT 'available',
	CONSTRAINT `restaurant_tables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_module_id_modules_id_fk` FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices_table` ADD CONSTRAINT `invoices_table_order_id_orders_table_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders_table`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices_table` ADD CONSTRAINT `invoices_table_generated_by_user_id_users_id_fk` FOREIGN KEY (`generated_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings_tables` ADD CONSTRAINT `bookings_tables_table_id_restaurant_tables_id_fk` FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings_tables` ADD CONSTRAINT `bookings_tables_booked_by_user_id_users_id_fk` FOREIGN KEY (`booked_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `menu_item_options` ADD CONSTRAINT `menu_item_options_menu_item_id_menu_items_id_fk` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `menu_items` ADD CONSTRAINT `menu_items_category_id_menu_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `menu_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items_table` ADD CONSTRAINT `order_items_table_order_id_orders_table_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders_table`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items_table` ADD CONSTRAINT `order_items_table_menu_item_id_menu_items_id_fk` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items_table` ADD CONSTRAINT `order_items_table_menu_item_option_id_menu_item_options_id_fk` FOREIGN KEY (`menu_item_option_id`) REFERENCES `menu_item_options`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders_table` ADD CONSTRAINT `orders_table_table_id_restaurant_tables_id_fk` FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders_table` ADD CONSTRAINT `orders_table_waiter_id_users_id_fk` FOREIGN KEY (`waiter_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;