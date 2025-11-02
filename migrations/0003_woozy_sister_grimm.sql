DROP INDEX "file_page_id_idx";--> statement-breakpoint
DROP INDEX "folder_user_id_idx";--> statement-breakpoint
DROP INDEX "folder_deleted_idx";--> statement-breakpoint
DROP INDEX "page_folder_id_idx";--> statement-breakpoint
DROP INDEX "page_deleted_idx";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
ALTER TABLE `file` ALTER COLUMN "lang" TO "lang" text NOT NULL DEFAULT 'plaintext';--> statement-breakpoint
CREATE INDEX `file_page_id_idx` ON `file` (`page_id`);--> statement-breakpoint
CREATE INDEX `folder_user_id_idx` ON `folder` (`user_id`);--> statement-breakpoint
CREATE INDEX `folder_deleted_idx` ON `folder` (`is_deleted`);--> statement-breakpoint
CREATE INDEX `page_folder_id_idx` ON `page` (`folder_id`);--> statement-breakpoint
CREATE INDEX `page_deleted_idx` ON `page` (`is_deleted`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
ALTER TABLE `file` ALTER COLUMN "content" TO "content" text NOT NULL DEFAULT '';
