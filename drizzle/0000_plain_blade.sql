CREATE TABLE `activity_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event_type` text NOT NULL,
	`activity` text,
	`points` integer DEFAULT 0 NOT NULL,
	`day` text NOT NULL,
	`occurred_at` text NOT NULL
);
