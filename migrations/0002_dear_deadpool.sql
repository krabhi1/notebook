CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text,
	`name` text NOT NULL,
	`meta` text DEFAULT '{}' NOT NULL,
	`content` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade
);
