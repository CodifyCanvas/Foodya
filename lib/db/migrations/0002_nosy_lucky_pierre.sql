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
	`roleId` int,
	`moduleId` int,
	`label` varchar(255),
	`can_view` boolean DEFAULT false,
	`can_edit` boolean DEFAULT false,
	`can_create` boolean DEFAULT false,
	`can_delete` boolean DEFAULT false,
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `name` varchar(255);--> statement-breakpoint
ALTER TABLE `roles` ADD CONSTRAINT `roles_role_unique` UNIQUE(`role`);--> statement-breakpoint
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_roleId_roles_id_fk` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_moduleId_modules_id_fk` FOREIGN KEY (`moduleId`) REFERENCES `modules`(`id`) ON DELETE no action ON UPDATE no action;