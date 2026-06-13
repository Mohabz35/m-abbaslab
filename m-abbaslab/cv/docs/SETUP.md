# CV Generator Pro - Integration Setup Guide

This guide walks you through integrating the CV Generator Pro module into your m-abbaslab system.

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- Access to your m-abbaslab repository
- Paystack account with API keys
- Manus LLM API access
- Database access (MySQL/TiDB)

## Step 1: Copy Module Files

The CV module files are located in `/cv` directory:

```
cv/
├── backend/          # Server-side code
├── frontend/         # React components
├── docs/             # Documentation
└── README.md         # Module overview
```

## Step 2: Database Setup

### Create Tables

Run the SQL migrations from `backend/drizzle/migrations/`:

```sql
-- Create cv_form_data table
CREATE TABLE cv_form_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  personalInfo JSON,
  workExperience JSON,
  education JSON,
  skills JSON,
  targetPlatform VARCHAR(50),
  customInstructions TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Create cv_generations table
CREATE TABLE cv_generations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  formDataId INT,
  targetPlatform VARCHAR(50) NOT NULL,
  generatedCV LONGTEXT,
  generatedCoverLetter LONGTEXT,
  atsScore INT,
  atsChecks JSON,
  suggestedImprovements JSON,
  isHumanized BOOLEAN DEFAULT FALSE,
  isPaid BOOLEAN DEFAULT FALSE,
  paymentStatus VARCHAR(20) DEFAULT 'free',
  pdfStorageKey VARCHAR(255),
  status VARCHAR(20) DEFAULT 'generated',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (formDataId) REFERENCES cv_form_data(id)
);

-- Create paystack_transactions table
CREATE TABLE paystack_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  cvGenerationId INT,
  amount INT DEFAULT 50,
  reference VARCHAR(255) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending',
  paymentMethod VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (cvGenerationId) REFERENCES cv_generations(id)
);

-- Add freeCreditsUsed to users table
ALTER TABLE users ADD COLUMN freeCreditsUsed BOOLEAN DEFAULT FALSE;
```

## Step 3: Backend Integration

### 3.1 Copy Server Files

```bash
cp -r cv/backend/server/* your-project/server/
cp -r cv/backend/drizzle/* your-project/drizzle/
```

### 3.2 Update Main Router

In your `server/routers.ts`, add:

```typescript
import { cvFormRouter } from "./routers/cvForm";
import { cvGenerationRouter } from "./routers/cvGeneration";
import { paymentRouter } from "./routers/payment";
import { deliveryRouter } from "./routers/delivery";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      // ... existing logout logic
    }),
  }),
  cvForm: cvFormRouter,
  cvGeneration: cvGenerationRouter,
  payment: paymentRouter,
  delivery: deliveryRouter,
});
```

### 3.3 Environment Variables

Add to your `.env` file:

```env
# Paystack Configuration
PAYSTACK_PUBLIC_KEY=pk_test_541a1b415565e92ee83bc247ef5a3fe3d56ec6e4
PAYSTACK_SECRET_KEY=sk_test_c4209d2dddb9249e00791f09eb612602b9321025

# LLM API (usually pre-configured in Manus)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
```

## Step 4: Frontend Integration

### 4.1 Copy React Components

```bash
cp -r cv/frontend/pages/* your-project/client/src/pages/
cp -r cv/frontend/components/* your-project/client/src/components/
```

### 4.2 Update App Router

In your `client/src/App.tsx`:

```typescript
import Home from "./pages/Home";
import CVBuilder from "./pages/CVBuilder";
import CVPreviewPage from "./pages/CVPreviewPage";
import History from "./pages/History";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/builder"} component={CVBuilder} />
      <Route path={"/preview"} component={CVPreviewPage} />
      <Route path={"/history"} component={History} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}
```

### 4.3 Update Navigation

Add links to your main navigation component:

```typescript
<Link href="/builder">Create CV</Link>
<Link href="/history">My CVs</Link>
```

## Step 5: Dependencies

Ensure these packages are installed:

```bash
npm install zod drizzle-orm mysql2 date-fns sonner
npm install -D drizzle-kit
```

## Step 6: Testing

### 6.1 Test Database Connection

```bash
npm run db:push
```

### 6.2 Test Backend API

```bash
npm run dev
```

Visit `http://localhost:3000/api/trpc/cvForm.retrieve` to test the API.

### 6.3 Test Frontend

1. Navigate to `/builder` to test the form
2. Fill out the form and click "Generate CV"
3. Check the preview page
4. Test payment flow with Paystack test card: `4242 4242 4242 4242`

## Step 7: Production Deployment

### 7.1 Update Paystack Keys

Replace test keys with production keys:

```env
PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_SECRET_KEY=sk_live_...
```

### 7.2 Configure Email

Update email configuration in `server/email.ts` to use your email service:

```typescript
// Replace the placeholder with your actual email service
// Example: SendGrid, Mailgun, AWS SES
```

### 7.3 Set Up Webhooks

Configure Paystack webhook in your dashboard:

- Webhook URL: `https://your-domain.com/api/webhooks/paystack`
- Events: `charge.success`, `charge.failed`

### 7.4 Enable HTTPS

Ensure all payment pages use HTTPS.

### 7.5 Test End-to-End

1. Create a test CV
2. Complete payment flow
3. Verify PDF download
4. Verify email delivery
5. Check database records

## Step 8: Monitoring & Maintenance

### Set Up Logging

Monitor these key areas:

- LLM API usage and costs
- Payment transaction success rates
- Email delivery failures
- Database performance
- Error rates

### Regular Maintenance

- Review and optimize database queries
- Monitor API rate limits
- Update dependencies monthly
- Audit payment records
- Clean up old temporary files

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
mysql -h your-host -u your-user -p your-database

# Check migrations
npm run drizzle-kit generate
```

### API Key Issues

Verify keys are correctly set:

```bash
# Check environment variables
echo $PAYSTACK_PUBLIC_KEY
echo $PAYSTACK_SECRET_KEY
```

### LLM Generation Failures

- Check API quota
- Verify credentials
- Review error logs
- Test with simpler prompts

### Payment Processing Issues

- Verify Paystack account status
- Check network connectivity
- Review transaction logs
- Test with test keys first

## Support

For issues or questions, refer to:
1. Module README.md
2. Platform-specific guides in docs/
3. Error logs in `.manus-logs/`
4. Paystack documentation: https://paystack.com/docs

## Next Steps

After successful integration:

1. Customize platform-specific prompts in `cvGeneration.ts`
2. Add your branding to the landing page
3. Set up analytics tracking
4. Configure email templates
5. Train support team on the feature
6. Market the CV Generator to users

## Version Control

Commit the integrated code:

```bash
git add cv/
git commit -m "feat: integrate CV Generator Pro module"
git push origin main
```

## Rollback Plan

If issues occur, you can rollback:

```bash
# Remove CV module
rm -rf cv/

# Revert database changes
# Run reverse migrations or restore from backup

# Revert code changes
git revert <commit-hash>
```

---

**Integration Date:** June 13, 2026
**Module Version:** 1.0.0
**Status:** Production Ready
