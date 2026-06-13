# CV Generator Pro Module

A premium, AI-powered CV and Cover Letter generator integrated into the m-abbaslab system. This module provides intelligent, platform-specific CV generation with ATS optimization and payment processing.

## Features

### 1. **Multi-Step Form Builder**
- 6-step guided form for comprehensive CV data collection
- Personal information, work experience, education, skills
- Target platform selection (LinkedIn, FlexJobs, Remote.co, Indeed, Upwork)
- Custom instructions for personalized generation
- Auto-save and draft recovery

### 2. **AI-Powered Generation**
- Platform-specific CV and cover letter generation
- Tailored prompts for each job board's requirements
- AI humanization layer to pass detection tools (GPTZero, Turnitin, Copyleaks)
- Context-aware content generation using Manus LLM API

### 3. **ATS Optimization Engine**
- Comprehensive scoring system (0-100 points)
- 5 key checks:
  - Keyword matching (50 points)
  - Formatting compliance (20 points)
  - Header structure (10 points)
  - Contact info presence (10 points)
  - File format readiness (10 points)
- Detailed pass/fail report
- Suggested improvements list

### 4. **Live Preview System**
- Real-time CV preview with formatting
- ATS score display with detailed breakdown
- Improvement suggestions before download
- Professional PDF-like styling

### 5. **Payment Integration (Paystack)**
- Freemium model: First CV free, 50 kobo per subsequent CV
- Secure Paystack checkout integration
- Transaction tracking and history
- User credit management

### 6. **Delivery Options**
- PDF download with professional formatting
- Email delivery to user's inbox
- Download history tracking
- Re-download capability

### 7. **User Account System**
- CV generation history with metadata
- Free credit tracking
- Billing history
- User profile management

## Directory Structure

```
cv/
├── backend/
│   ├── server/
│   │   ├── routers/
│   │   │   ├── cvForm.ts          # Form save/retrieve procedures
│   │   │   ├── cvGeneration.ts    # AI generation procedures
│   │   │   ├── payment.ts         # Paystack payment procedures
│   │   │   └── delivery.ts        # Download/email procedures
│   │   ├── ats.ts                 # ATS optimization engine
│   │   ├── pdf.ts                 # PDF generation service
│   │   ├── email.ts               # Email delivery service
│   │   ├── paystack.ts            # Paystack integration
│   │   ├── db.ts                  # Database helpers
│   │   └── routers.ts             # Main router registration
│   ├── drizzle/
│   │   ├── schema.ts              # Database tables and types
│   │   ├── relations.ts           # Table relationships
│   │   └── migrations/            # SQL migration files
│   └── tests/
│       └── paystack.test.ts       # Paystack API validation
├── frontend/
│   ├── pages/
│   │   ├── Home.tsx               # Landing page
│   │   ├── CVBuilder.tsx          # Multi-step form
│   │   ├── CVPreviewPage.tsx      # Preview and results
│   │   └── History.tsx            # User CV history
│   └── components/
│       ├── CVPreview.tsx          # CV display component
│       ├── PaymentGate.tsx        # Paystack checkout
│       └── [shadcn/ui components]
├── docs/
│   ├── API.md                     # API documentation
│   ├── SETUP.md                   # Integration guide
│   └── PLATFORMS.md               # Platform-specific guidelines
└── README.md                      # This file
```

## Database Schema

### Users Table (Extended)
- `id` - Primary key
- `openId` - Manus OAuth identifier
- `name`, `email`, `loginMethod`
- `role` - admin | user
- `freeCreditsUsed` - Track first free CV
- `createdAt`, `updatedAt`, `lastSignedIn`

### CV Form Data Table
- `id` - Primary key
- `userId` - Foreign key to users
- `personalInfo` - JSON (name, email, phone, location, summary)
- `workExperience` - JSON array
- `education` - JSON array
- `skills` - JSON array
- `targetPlatform` - Selected job board
- `customInstructions` - User-provided guidance
- `createdAt`, `updatedAt`

### CV Generations Table
- `id` - Primary key
- `userId` - Foreign key to users
- `formDataId` - Reference to form data
- `targetPlatform` - LinkedIn | FlexJobs | Remote.co | Indeed | Upwork
- `generatedCV` - Full CV content (markdown)
- `generatedCoverLetter` - Cover letter content
- `atsScore` - 0-100 score
- `atsChecks` - JSON array of passed/failed checks
- `suggestedImprovements` - JSON array
- `isHumanized` - Boolean flag
- `isPaid` - Payment status
- `paymentStatus` - free | pending | completed | failed
- `pdfStorageKey` - S3 storage reference
- `status` - generated | downloaded | emailed
- `createdAt`, `updatedAt`

### Paystack Transactions Table
- `id` - Primary key
- `userId` - Foreign key to users
- `cvGenerationId` - Reference to CV
- `amount` - 50 (kobo)
- `reference` - Paystack reference
- `status` - pending | success | failed
- `paymentMethod` - card | bank_transfer | mobile_money
- `createdAt`, `updatedAt`

## API Endpoints (tRPC Procedures)

### Form Management
- `cvForm.save` - Save CV form data (auto-upsert)
- `cvForm.retrieve` - Get user's saved draft

### CV Generation
- `cvGeneration.generate` - Generate CV and cover letter
- `cvGeneration.get` - Retrieve specific CV
- `cvGeneration.listByUser` - Get user's CVs
- `cvGeneration.update` - Update CV metadata

### Payment
- `payment.initializeCheckout` - Start Paystack payment
- `payment.verifyPayment` - Verify payment completion

### Delivery
- `delivery.downloadPDF` - Generate and download PDF
- `delivery.sendViaEmail` - Send CV via email
- `delivery.getCV` - Retrieve CV for viewing
- `delivery.getCVHistory` - Get user's CV history
- `delivery.getCVAsText` - Get plain text version

## Integration Steps

### 1. Database Setup
```bash
# Generate migrations
pnpm drizzle-kit generate

# Apply migrations
# Use webdev_execute_sql or your database tool
```

### 2. Environment Variables
Add to your `.env`:
```
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
```

### 3. Router Registration
In your main `routers.ts`:
```typescript
import { cvFormRouter } from "./routers/cvForm";
import { cvGenerationRouter } from "./routers/cvGeneration";
import { paymentRouter } from "./routers/payment";
import { deliveryRouter } from "./routers/delivery";

export const appRouter = router({
  cvForm: cvFormRouter,
  cvGeneration: cvGenerationRouter,
  payment: paymentRouter,
  delivery: deliveryRouter,
  // ... other routers
});
```

### 4. Frontend Routes
Add to your `App.tsx`:
```typescript
import CVBuilder from "@/pages/CVBuilder";
import CVPreviewPage from "@/pages/CVPreviewPage";
import History from "@/pages/History";

<Route path={"/builder"} component={CVBuilder} />
<Route path={"/preview"} component={CVPreviewPage} />
<Route path={"/history"} component={History} />
```

### 5. Navigation Links
Add to your main navigation:
```typescript
<Link href="/builder">Create CV</Link>
<Link href="/history">My CVs</Link>
```

## Platform-Specific Guidelines

### LinkedIn
- Focus on professional achievements
- Highlight quantifiable results
- Use industry-specific keywords
- Emphasize leadership and collaboration

### FlexJobs
- Highlight remote work experience
- Emphasize self-management skills
- Include relevant certifications
- Focus on flexibility and adaptability

### Remote.co
- Showcase distributed team experience
- Highlight communication skills
- Include timezone flexibility
- Emphasize time management

### Indeed
- Use common job title variations
- Include relevant certifications
- Highlight measurable achievements
- Focus on technical skills

### Upwork
- Emphasize project-based experience
- Highlight client testimonials
- Include portfolio links
- Focus on specific deliverables

## Testing

### Unit Tests
```bash
pnpm test
```

### Manual Testing Checklist
- [ ] Form saves and recovers correctly
- [ ] All 5 platforms generate unique CVs
- [ ] ATS score calculates accurately
- [ ] Payment flow works (test Paystack keys)
- [ ] PDF downloads successfully
- [ ] Email delivery works
- [ ] History page displays all CVs
- [ ] Free first CV logic works
- [ ] Paid CVs require payment

## Deployment

### Production Checklist
- [ ] Update Paystack keys to production
- [ ] Configure email templates
- [ ] Set up webhook for payment confirmations
- [ ] Enable HTTPS for payment pages
- [ ] Test end-to-end payment flow
- [ ] Monitor LLM API usage
- [ ] Set up error logging
- [ ] Configure backup strategy

## Performance Optimization

### Frontend
- Lazy load preview components
- Debounce form saves
- Cache CV history
- Optimize PDF generation

### Backend
- Cache LLM responses for similar inputs
- Batch process email deliveries
- Implement rate limiting for generation
- Monitor database query performance

## Security Considerations

- Validate all user inputs on backend
- Sanitize LLM outputs
- Encrypt sensitive payment data
- Use HTTPS for all API calls
- Implement CSRF protection
- Rate limit payment endpoints
- Audit payment transactions

## Troubleshooting

### LLM Generation Fails
- Check API credentials
- Verify rate limits
- Review error logs
- Test with simpler prompts

### Payment Issues
- Verify Paystack keys
- Check network connectivity
- Review transaction logs
- Test with test card: 4242 4242 4242 4242

### Email Delivery Issues
- Verify email configuration
- Check sender authentication
- Review email logs
- Test with test email

## Future Enhancements

- [ ] Multiple CV design templates
- [ ] Batch generation for multiple platforms
- [ ] LinkedIn profile auto-population
- [ ] Job board integration for tailored CVs
- [ ] Cover letter templates
- [ ] Analytics dashboard
- [ ] A/B testing for different prompts
- [ ] Multi-language support

## Support & Maintenance

For issues or questions:
1. Check the troubleshooting section
2. Review error logs
3. Test with minimal inputs
4. Contact the development team

## License

Part of m-abbaslab system. All rights reserved.

## Version History

- **v1.0.0** (June 2026) - Initial release with full feature set
  - Multi-step form builder
  - AI generation engine
  - ATS optimization
  - Paystack payment integration
  - PDF and email delivery
  - User history tracking
