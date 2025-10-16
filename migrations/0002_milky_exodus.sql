-- Create the file table
CREATE TABLE `file` (
	`id` text PRIMARY KEY NOT NULL,
	`page_id` text NOT NULL,
	`name` text NOT NULL,
	`lang` text,
	`content` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `page`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `file_page_id_idx` ON `file` (`page_id`);
--> statement-breakpoint

-- Create new page table without user_id and other columns
CREATE TABLE `page_new` (
	`id` text PRIMARY KEY NOT NULL,
	`folder_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`is_deleted` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`folder_id`) REFERENCES `folder`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Copy data from old page table (excluding dropped columns)
INSERT INTO `page_new` (`id`, `folder_id`, `name`, `type`, `is_deleted`, `created_at`, `updated_at`)
SELECT `id`, `folder_id`, `name`, `type`, `is_deleted`, `created_at`, `updated_at`
FROM `page`;
--> statement-breakpoint

-- Drop old table and rename new one
DROP TABLE `page`;
--> statement-breakpoint
ALTER TABLE `page_new` RENAME TO `page`;
--> statement-breakpoint

-- Recreate indexes for page table
CREATE INDEX `page_folder_id_idx` ON `page` (`folder_id`);
--> statement-breakpoint
CREATE INDEX `page_deleted_idx` ON `page` (`is_deleted`);
--> statement-breakpoint

-- Add missing columns to other tables
ALTER TABLE `folder` ADD `updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL;
--> statement-breakpoint
ALTER TABLE `user` ADD `updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL;
