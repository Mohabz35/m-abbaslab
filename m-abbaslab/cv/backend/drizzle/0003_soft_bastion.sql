ALTER TABLE `cv_generations` ADD `isPaid` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `cv_generations` ADD `paymentStatus` enum('pending','completed','failed','free') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `cv_generations` ADD `paymentReference` varchar(255);--> statement-breakpoint
ALTER TABLE `cv_generations` ADD `paidAt` timestamp;