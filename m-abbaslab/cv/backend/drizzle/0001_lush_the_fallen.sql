CREATE TABLE `cv_form_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`personalInfo` json NOT NULL,
	`workExperience` json NOT NULL,
	`education` json NOT NULL,
	`skills` json NOT NULL,
	`targetPlatform` enum('linkedin','flexjobs','remote_co','indeed','upwork'),
	`customInstructions` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cv_form_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cv_generations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`targetPlatform` enum('linkedin','flexjobs','remote_co','indeed','upwork') NOT NULL,
	`customInstructions` text,
	`generatedCV` text NOT NULL,
	`generatedCoverLetter` text,
	`atsScore` int,
	`atsChecks` json,
	`suggestedImprovements` json,
	`isHumanized` boolean DEFAULT false,
	`pdfStorageKey` varchar(255),
	`status` enum('draft','generated','paid','downloaded','emailed') DEFAULT 'draft',
	`paymentId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cv_generations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stripe_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cvGenerationId` int,
	`stripePaymentIntentId` varchar(255) NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) DEFAULT 'USD',
	`status` enum('pending','succeeded','failed','canceled') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stripe_transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripe_transactions_stripePaymentIntentId_unique` UNIQUE(`stripePaymentIntentId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `freeCreditsUsed` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalCVsGenerated` int DEFAULT 0 NOT NULL;