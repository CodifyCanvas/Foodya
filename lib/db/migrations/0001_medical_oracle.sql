CREATE TABLE `menu_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `menu_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_item_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`menu_item_id` int NOT NULL,
	`option_name` varchar(255),
	`price` decimal(10,2) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `menu_item_options_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(255),
	`price` decimal(10,2) NOT NULL,
	`is_available` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `menu_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `menu_item_options` ADD CONSTRAINT `menu_item_options_menu_item_id_menu_items_id_fk` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `menu_items` ADD CONSTRAINT `menu_items_category_id_menu_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `menu_categories`(`id`) ON DELETE no action ON UPDATE no action;