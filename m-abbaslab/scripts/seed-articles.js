const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nspzkkemwaaokpiykfvv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zcHpra2Vtd2Fhb2twaXlrZnZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTExNjE4MCwiZXhwIjoyMDk0NjkyMTgwfQ.yMnJUSVqgwkPO4LtqayX7V8EQNcvTNE2ojAnPNTNuoM'

const supabase = createClient(supabaseUrl, supabaseKey)

const articles = [
  // ─── Economics Simplified ───────────────────────────────────────
  {
    title: 'Why Prices Keep Going Up: Understanding Inflation',
    slug: 'why-prices-keep-going-up-understanding-inflation',
    excerpt: 'A plain-language guide to what inflation is, why it happens, and how it silently reshapes your purchasing power every single year.',
    content: `## What Is Inflation?

Inflation is the rate at which the general level of prices for goods and services rises over time. When inflation occurs, each unit of currency buys fewer goods and services — your money loses purchasing power.

Think of it this way: if a cup of coffee costs \$100 today and inflation is 5%, that same cup will cost \$105 next year. Your salary might go up, but if it only goes up by 3%, you can actually afford less coffee than before.

## Why Does Inflation Happen?

There are three main drivers of inflation:

### Demand-Pull Inflation

This happens when demand for goods and services exceeds supply. Imagine there are only 100 bags of rice in a market but 200 people want to buy them. The price goes up because people compete for limited supply.

After COVID-19, governments around the world sent stimulus checks to citizens. People had more money to spend, but factories were still catching up on production. The result? Prices surged.

### Cost-Push Inflation

When it becomes more expensive to produce goods, companies pass those costs to consumers. If the price of oil doubles, it costs more to transport food, which means higher grocery prices.

The Russia-Ukraine war in 2022 is a perfect example. Oil and wheat prices spiked globally, and suddenly everything from petrol to bread became more expensive.

### Built-In Inflation (Wage-Price Spiral)

Workers see prices rising and demand higher wages. Companies then raise prices to cover the higher wages. This creates a self-reinforcing cycle.

## How Is Inflation Measured?

The most common measure is the Consumer Price Index (CPI), which tracks the average change in prices paid by consumers for a basket of goods and services.

In Kenya, the Kenya National Bureau of Statistics (KNBS) publishes monthly CPI data. The basket includes food, housing, transport, education, and healthcare.

### The Formula

\`\`\`
Inflation Rate = ((CPI in Year 2 - CPI in Year 1) / CPI in Year 1) x 100
\`\`\`

If the CPI was 120 last year and 126 this year, inflation is 5%.

## Is Inflation Always Bad?

Not necessarily. Moderate inflation (around 2-3%) is considered healthy for an economy because:

- It encourages spending and investment rather than hoarding cash
- It allows businesses to gradually raise wages
- It gives central banks room to maneuver during recessions

The problem is when inflation becomes too high (hyperinflation) or too low (deflation).

### Hyperinflation: When It Goes Wrong

Zimbabwe in 2008 experienced hyperinflation of 79.6 billion percent per month. Prices doubled every 24 hours. People needed wheelbarrows of cash to buy bread.

### Deflation: The Silent Killer

Japan spent decades fighting deflation — falling prices. When people expect prices to drop tomorrow, they delay purchases today. Businesses earn less, lay off workers, and the economy shrinks.

## How Central Banks Fight Inflation

Central banks use monetary policy tools:

- **Raising interest rates**: Makes borrowing more expensive, reducing spending
- **Reducing money supply**: Selling government bonds to absorb cash from the economy
- **Reserve requirements**: Forcing banks to hold more money in reserve, reducing lending

The Central Bank of Kenya (CBK) raised its benchmark rate from 7% to 13% between 2022 and 2023 to combat rising inflation.

## What Can You Do?

- **Invest in assets that appreciate**: Real estate, stocks, or business ventures
- **Build an emergency fund**: 3-6 months of expenses in an accessible account
- **Increase your financial literacy**: Understanding inflation helps you make better decisions
- **Negotiate your salary**: Don't let your real income decline silently

## Key Takeaways

- Inflation is the gradual increase in prices over time
- Moderate inflation is normal and healthy
- High inflation erodes your purchasing power rapidly
- Central banks are the primary fighters of inflation
- Personal financial planning is your best defense`,
    category: 'economics',
    tags: ['economics', 'inflation', 'personal finance', 'macroeconomics', 'central banks'],
    read_time: 8,
    status: 'published',
    featured: true,
    created_at: '2026-06-01T10:00:00Z',
    published_at: '2026-06-01T10:00:00Z',
  },

  // ─── Statistics Demystified ────────────────────────────────────
  {

    title: "P-Values: What They Really Mean (And Don't Mean)",
    slug: 'p-values-what-they-really-mean',
    excerpt: "Demystify p-values and statistical significance without the jargon. Learn why p < 0.05 isn't a magic threshold and what you should actually look for.",
    content: `## The Mysterious P-Value

If you've ever read a research paper, you've seen the phrase "p < 0.05." It's treated like a stamp of approval — as if crossing this threshold makes a finding "true." But that's not what p-values actually tell us.

Let's fix that.

## What Is a P-Value?

A p-value answers one specific question:

> If there were truly no effect or no difference, how likely is it that we'd see data this extreme (or more extreme) by random chance?

That's it. It's a probability about your data, assuming the null hypothesis is true.

### A Coin Flip Analogy

Imagine someone claims they have a fair coin. You flip it 10 times and get 8 heads. Is the coin unfair?

The p-value asks: "If the coin WERE fair, how likely is it to get 8 or more heads in 10 flips?" The answer is about 5.5%. That's your p-value.

If you set your threshold at 5% (p < 0.05), you'd reject the idea that the coin is fair. But there's still a 5.5% chance you're wrong — the coin might be fair, and you just got lucky.

## What P-Values Do NOT Mean

This is where most people go wrong:

### Wrong: "The probability the null hypothesis is false"

No. A p-value of 0.03 does NOT mean there's a 97% chance the treatment works. It means that IF the treatment had no effect, there's a 3% chance of seeing results this extreme.

### Wrong: "The probability the result is due to chance"

Also no. Everything is partly due to chance. The p-value quantifies how extreme the data is under a specific assumption.

### Wrong: "The size of the effect"

A tiny, practically meaningless effect can produce a very small p-value if the sample size is large enough. With 1 million data points, you can detect differences of 0.001 with p < 0.001. Statistical significance does not equal practical significance.

## The Problem with p < 0.05

The 0.05 threshold was popularized by Ronald Fisher in the 1920s as a convenient cutoff, not a scientific law. It has since been criticized extensively:

### Multiple Testing Problem

If you test 20 hypotheses at p < 0.05, you'd expect 1 false positive purely by chance (20 × 0.05 = 1). In genomics, where thousands of genes are tested simultaneously, this is catastrophic without correction.

### P-Hacking

Researchers can unconsciously (or consciously) manipulate analyses until they get p < 0.05:

- Testing multiple outcomes and only reporting the significant one
- Adding or removing data points
- Trying different statistical models
- Stopping data collection once p < 0.05 is reached

### The Replication Crisis

In 2015, the Open Science Collaboration tried to replicate 100 psychology studies. Only 36% produced significant results the second time. The original studies likely had inflated effect sizes due to publication bias toward p < 0.05.

## What Should You Look For Instead?

### Effect Size

How large is the difference? Cohen's d, odds ratios, or risk differences tell you the practical importance of a finding.

A drug that reduces blood pressure by 2 mmHg (d = 0.1) is statistically significant in a large trial but clinically irrelevant.

### Confidence Intervals

A 95% CI tells you the range of plausible values for the true effect. It's more informative than a single p-value because it shows precision.

A 95% CI of [0.1, 12.5] for an odds ratio is technically significant (doesn't include 1.0) but wildly imprecise — the true effect could be tiny or enormous.

### Bayesian Analysis

Bayesian methods ask: "Given the data, what's the probability the hypothesis is true?" This is usually what people THINK a p-value tells them.

Bayes factors give you a continuous measure of evidence strength rather than a binary significant/not-significant decision.

## A Practical Framework

When reading research, ask:

1. **What's the effect size?** (Not just "is it significant?")
2. **How wide is the confidence interval?** (How precise is the estimate?)
3. **How was the study designed?** (RCT > observational)
4. **Is there a pre-registration?** (Reduces p-hacking)
5. **Has it been replicated?** (The gold standard)

## Key Takeaways

- A p-value is the probability of seeing data this extreme if the null hypothesis is true
- p < 0.05 is a convention, not a scientific truth
- Statistical significance does not equal practical importance
- Always look at effect sizes and confidence intervals alongside p-values
- Be skeptical of any finding that hasn't been independently replicated`,
    category: 'statistics',
    tags: ['statistics', 'p-values', 'data literacy', 'research methods', 'replication crisis'],
    read_time: 9,
    status: 'published',
    featured: true,

    created_at: '2026-06-05T10:00:00Z',
    published_at: '2026-06-05T10:00:00Z',
  },

  // ─── Complex Concepts ──────────────────────────────────────────
  {
    title: 'Quantitative Easing: What Central Banks Really Do',
    slug: 'quantitative-easing-what-central-banks-really-do',
    excerpt: 'Breaking down one of the most misunderstood tools in modern monetary policy — when interest rates alone aren\'t enough.',
    content: `## The Basics: What Is Quantitative Easing?

Quantitative Easing (QE) is when a central bank creates new money electronically and uses it to buy government bonds and other financial assets from commercial banks.

The goal? To increase the money supply, lower long-term interest rates, and stimulate economic activity when conventional tools have been exhausted.

## When Is QE Used?

Central banks normally control the economy by adjusting short-term interest rates. When the economy is slow, they lower rates to encourage borrowing. When it's overheating, they raise rates.

But what happens when rates hit zero and the economy is still struggling? This is called the "zero lower bound" problem, and it's exactly where QE comes in.

### The 2008 Financial Crisis

After the 2008 crash, the US Federal Reserve cut rates to near zero. But the economy was still in freefall. The Fed then launched QE1 — buying \$600 billion in mortgage-backed securities and government bonds.

This was followed by QE2 (2010), QE3 (2012), and eventually the Fed's balance sheet grew from \$900 billion to over \$4.5 trillion.

### COVID-19 Response

In March 2020, the Fed announced unlimited QE — literally promising to buy whatever it took to stabilize markets. Within months, the balance sheet jumped from \$4 trillion to over \$7 trillion.

## How QE Actually Works

### Step 1: The Central Bank Creates Money

Not physical cash — digital money. The Fed types numbers into a computer. This new money didn't exist before.

### Step 2: Buy Bonds from Banks

The Fed uses this new money to buy government bonds (Treasuries) from commercial banks. The banks now have more cash reserves.

### Step 3: Banks Lend More

With more reserves, banks are theoretically more willing to lend to businesses and consumers.

### Step 4: Lower Interest Rates

The increased demand for bonds pushes their prices up and yields (interest rates) down. Lower bond yields mean lower borrowing costs across the economy.

## The Transmission Mechanism

QE affects the economy through several channels:

### Portfolio Rebalancing Channel

When the Fed buys government bonds, investors who sold them now hold cash instead. They reinvest in riskier assets — corporate bonds, stocks, real estate. This pushes up asset prices and lowers borrowing costs for companies.

### Wealth Effect

Higher stock and property prices make people feel wealthier. They spend more. At least in theory.

### Exchange Rate Channel

Lower interest rates make US dollar assets less attractive to foreign investors. The dollar weakens, making US exports cheaper and boosting domestic production.

## The Controversies

### Inflation Concerns

Critics argue that creating trillions of dollars must cause inflation. But for over a decade after 2008, inflation remained below target in most developed economies.

Why? Because the new money stayed largely in the financial system rather than flowing into the real economy. Banks held excess reserves instead of lending aggressively.

### Inequality

QE inflates asset prices — stocks, bonds, real estate. Who owns these assets? Wealthy people. QE has been criticized for widening the wealth gap.

Between 2009 and 2021, the S&P 500 rose over 600%. If you owned stocks, you got richer. If you didn't, you got left behind.

### Moral Hazard

If central banks always step in to save markets, financial institutions take excessive risks knowing they'll be bailed out.

## QE in Developing Countries

QE is primarily a tool of developed economies with reserve currencies. When the US Fed does QE, it affects the whole world:

- Capital floods into emerging markets chasing higher returns
- Local currencies appreciate, hurting exports
- When QE ends ("tapering"), capital flows back out, causing instability

The "taper tantrum" of 2013 saw emerging market currencies crash when the Fed hinted at reducing QE.

## Key Takeaways

- QE is when central banks create money to buy financial assets
- It's used when interest rates are already at zero
- It works by lowering long-term rates and boosting asset prices
- It's controversial because of inequality effects and inflation concerns
- Its global impact on developing economies is significant and often destabilizing`,
    category: 'complex-concepts',
    tags: ['monetary policy', 'central banks', 'macroeconomics', 'Federal Reserve', 'QE'],
    read_time: 10,
    status: 'published',
    featured: false,

    created_at: '2026-06-10T10:00:00Z',
    published_at: '2026-06-10T10:00:00Z',
  },

  // ─── Problem-Solving ───────────────────────────────────────────
  {
    title: 'The Feynman Technique: A Framework for Deep Understanding',
    slug: 'feynman-technique-framework-for-deep-understanding',
    excerpt: 'Learn how Nobel Prize winner Richard Feynman approached complex problems — and how you can use the same method to master any subject.',
    content: `## Who Was Feynman?

Richard Feynman was a Nobel Prize-winning physicist known for his ability to explain complex concepts in simple terms. He famously said:

> "If you can't explain it to a six-year-old, you don't understand it yourself."

The Feynman Technique is his systematic approach to learning and understanding.

## The Four Steps

### Step 1: Choose a Concept

Pick the topic you want to understand. Write the concept name at the top of a blank sheet of paper.

Don't pick something vague like "machine learning." Pick something specific: "How does a neural network learn?" or "What is gradient descent?"

### Step 2: Teach It to a Child

Explain the concept in plain language, as if you're teaching it to someone with no background in the subject. Use simple words. Avoid jargon.

Write your explanation on the paper. If you're explaining gradient descent:

"When you're trying to find the bottom of a valley in the dark, you feel the ground with your feet and take a step in the direction that goes downhill. You keep doing this until you can't go any further down. That's gradient descent — finding the best answer by always moving in the direction that reduces error."

### Step 3: Identify Gaps

When you get stuck, when you have to resort to jargon, when you can't simplify further — that's where your understanding breaks down.

Go back to the source material. Read it again. Find a different explanation. Watch a video. Talk to someone. Fill the gap.

Then try explaining again from scratch.

### Step 4: Review and Simplify

Once you can explain it cleanly, review what you've written. Remove unnecessary complexity. Use analogies. Create a mental model that's simple and accurate.

If your explanation still has complicated words, you haven't simplified enough.

## Why It Works

### Active Recall

The technique forces you to actively retrieve information from memory rather than passively re-reading notes. Research shows active recall is 50-100% more effective than passive review.

### Metacognition

By trying to explain, you become aware of what you don't know. Most people overestimate their understanding until they try to teach it.

### Elaborative Interrogation

Simple explanations require deep processing. You can't explain something simply without understanding it deeply first.

## Applying It to Economics

Let's use the technique to understand "supply and demand":

**Step 1**: Supply and Demand

**Step 2**: Imagine a village where people grow mangoes. When there are few mangoes (low supply), people pay more because they're scared of running out. When there are lots of mangoes (high supply), nobody pays much because there's plenty for everyone. Similarly, if everyone in the village suddenly loves mangoes (high demand), prices go up. If nobody wants mangoes (low demand), prices drop.

**Step 3**: I'm struggling to explain how the equilibrium price is determined. Let me think... It's the point where the amount sellers want to sell equals the amount buyers want to buy. At that price, there's no leftover supply and no unmet demand.

**Step 4**: Supply and demand is like a dance between sellers and buyers. Sellers want high prices. Buyers want low prices. They meet in the middle at the equilibrium price, where what's available matches what's wanted.

## Applying It to Statistics

Concept: Confidence Intervals

**Teach**: Imagine you're estimating how many students at your university smoke. You survey 100 students and find 25% smoke. But you only asked 100 people, not everyone. If you repeated this survey 100 times, about 95 of those surveys would give you a range that includes the true percentage. That range is your 95% confidence interval.

**Gap**: I can explain what it means but not why 95% specifically. Let me look this up... 95% is a convention, but it corresponds to roughly 2 standard deviations from the mean in a normal distribution.

## Applying It to Machine Learning

Concept: Overfitting

**Teach**: Imagine studying for an exam by memorizing every practice question's answer instead of understanding the concepts. On the practice test, you score 100%. On the real exam with different questions, you fail. That's overfitting — your model memorized the training data instead of learning the underlying patterns.

## Tips for Using the Technique

- **Use paper, not screens**: Writing by hand engages different cognitive processes
- **Time yourself**: Spend 15-20 minutes per concept
- **Build a library**: Keep your explanations in a notebook or digital file
- **Teach real people**: Explaining to a friend is even better than imagining one
- **Revisit periodically**: spaced repetition strengthens understanding

## Key Takeaways

- The Feynman Technique has four steps: choose, teach, identify gaps, simplify
- If you can't explain it simply, you don't understand it well enough
- It works because of active recall, metacognition, and deep processing
- Apply it to any subject: economics, statistics, programming, anything
- Use paper and teach real people for maximum effectiveness`,
    category: 'problem-solving',
    tags: ['learning', 'Feynman technique', 'critical thinking', 'education', 'frameworks'],
    read_time: 8,
    status: 'published',
    featured: false,

    created_at: '2026-06-12T10:00:00Z',
    published_at: '2026-06-12T10:00:00Z',
  },

  // ─── Books & Writing ───────────────────────────────────────────
  {
    title: 'Atomic Habits by James Clear: A Practical Book Review',
    slug: 'atomic-habits-james-clear-book-review',
    excerpt: "An honest review of one of the most popular self-improvement books — what's genuinely useful, what's overhyped, and how to actually apply its lessons.",
    content: `## Why I Read This Book

Atomic Habits has sold over 15 million copies. It's recommended by athletes, CEOs, and productivity YouTubers. I wanted to find out: is it actually good, or just well-marketed?

After reading it cover to cover and applying its principles for three months, here's my honest take.

## The Core Idea

The central thesis is simple: **small habits, repeated consistently, produce remarkable results.** Clear calls these "atomic habits" — tiny changes that compound over time.

1% improvement every day for a year: 1.01^365 = 37.78x better.
1% worse every day: 0.99^365 = 0.03 (essentially nothing).

The math is compelling. But does the book deliver on this promise?

## What's Genuinely Useful

### The Four Laws of Behavior Change

Clear provides a practical framework:

1. **Make it Obvious** (Cue): Design your environment for success
2. **Make it Attractive** (Craving): Pair habits with things you enjoy
3. **Make it Easy** (Response): Reduce friction for good habits
4. **Make it Satisfying** (Reward): Reinforce with immediate rewards

This is the most actionable part of the book. I used it to build a reading habit:

- **Obvious**: Book on my pillow every morning
- **Attractive**: Read with coffee (pairing)
- **Easy**: Start with just 2 pages (two-minute rule)
- **Satisfying**: Check it off my habit tracker

Within two weeks, I was reading 20+ pages daily without effort.

### Identity-Based Habits

The most powerful concept in the book: **focus on who you want to become, not what you want to achieve.**

Instead of "I want to run a marathon," say "I am a runner."
Instead of "I want to write a book," say "I am a writer."

Every action becomes a vote for the type of person you want to be. This reframing changed how I approach fitness. Instead of forcing myself to exercise, I ask: "What would a healthy person do?"

### Habit Stacking

"After I [CURRENT HABIT], I will [NEW HABIT]."

After I pour my morning coffee, I will write for 10 minutes.
After I sit down at my desk, I will plan my top 3 priorities.

This leverages existing neural pathways to create new ones.

## What's Overhyped

### The 2-Minute Rule

Clear suggests scaling any habit down to two minutes. Want to exercise? Just put on your running shoes. Want to read? Read one page.

In practice, this feels patronizing for anyone with basic self-discipline. The concept is useful for people who struggle to start, but the book presents it as universal wisdom when it's really a crutch for the initiation phase.

### The Plateau of Latent Potential

Clear argues that results are delayed and you shouldn't get discouraged by a "plateau of latent potential." This is true but also conveniently unfalsifiable — if you don't see results, just wait longer.

Sometimes habits don't produce results because they're the wrong habits, not because you need more patience.

### The Neglect of Systems

While Clear does mention systems, the book is fundamentally about individual habit change. It doesn't deeply address how systems, environments, and social structures shape behavior.

If you're trying to eat healthy but live in a food desert with no grocery stores, "make it obvious" isn't going to cut it.

## What I Changed After Reading

### What I Kept

- Habit tracking (daily checklist)
- Environment design (removing phone from bedroom)
- Identity-based framing ("I am a reader," "I am a writer")
- The two-minute rule for habits I genuinely struggle to start

### What I Modified

- I don't obsess over streaks — life happens, and missing one day isn't failure
- I combine habit stacking with time-blocking for better structure
- I use the framework for professional habits, not just personal ones

### What I Ignored

- The habit scorecard (too tedious)
- The section on基因遗传 tendencies (interesting but not actionable)
- The advice to "never miss twice" — sometimes you need rest days

## Rating

**8/10** — The framework is genuinely useful and well-organized. The writing is clear (pun intended). It's one of the better self-improvement books because it's practical rather than motivational.

The main weakness is that it treats habit change as purely individual, ignoring systemic factors. And some of the examples feel repetitive.

## Who Should Read This

- Anyone trying to build a new habit (exercise, reading, writing)
- People who know what they should do but struggle to do it consistently
- Managers looking to build better team habits
- Students developing study routines

## Who Can Skip It

- People already skilled in habit formation
- Anyone looking for deep behavioral science (read "Thinking, Fast and Slow" instead)
- Those facing systemic barriers to behavior change

## Key Takeaways

- Small habits compound into remarkable results over time
- Focus on identity change ("I am X") rather than outcome change ("I want X")
- Design your environment to make good habits obvious and easy
- The book is practical and actionable, not just motivational
- It has blind spots around systemic factors and individual differences`,
    category: 'books-writing',
    tags: ['book review', 'habits', 'self-improvement', 'James Clear', 'productivity'],
    read_time: 10,
    status: 'published',
    featured: true,

    created_at: '2026-06-14T10:00:00Z',
    published_at: '2026-06-14T10:00:00Z',
  },

  // ─── Research ──────────────────────────────────────────────────
  {
    title: 'Mobile Money and Financial Inclusion in East Africa',
    slug: 'mobile-money-financial-inclusion-east-africa',
    excerpt: 'How M-Pesa and similar platforms transformed the financial landscape for millions of unbanked people — and what the data tells us.',
    content: `## Introduction

In 2007, Safaricom launched M-Pesa in Kenya. The premise was simple: let people send and receive money using their mobile phones. No bank account required.

Today, M-Pesa serves over 50 million users across Africa. It processes more transactions annually than Western Union does globally. It has fundamentally changed how money moves in developing economies.

This article examines the evidence on mobile money's impact on financial inclusion.

## The Scale of the Problem

Before mobile money, financial exclusion in East Africa was staggering:

- Only 26% of Kenyan adults had a bank account (2006)
- Banking infrastructure was concentrated in urban areas
- Transaction costs for sending money to rural areas were prohibitive
- The minimum balance requirements excluded low-income individuals

The World Bank estimates that 1.7 billion adults globally remained unbanked as of 2021. In Sub-Saharan Africa, the rate was 57%.

## How Mobile Money Works

M-Pesa's model is straightforward:

1. **Registration**: Users register at an M-Pesa agent with their ID
2. **Deposit**: Cash is converted to digital credit
3. **Transfer**: Users send money via SMS to any registered user
4. **Withdrawal**: Digital credit is converted back to cash at an agent

The key innovation was using existing airtime infrastructure as a financial network. Agents doubled as cash-out points, creating a physical presence in areas without banks.

## The Evidence on Financial Inclusion

### Account Ownership

The World Bank's Global Findex Database shows dramatic increases:

- Kenya: 26% (2006) → 83% (2021)
- Tanzania: 16% (2011) → 64% (2021)
- Uganda: 20% (2011) → 59% (2021)

M-Pesa was the primary driver of this increase in all three countries.

### Gender Gap Reduction

Before mobile money, the gender gap in financial inclusion in Kenya was 18 percentage points. By 2021, it had shrunk to 6 points. Mobile phones gave women financial access without needing to visit a bank branch — often a barrier due to distance, time, and social norms.

A 2016 study by Suri and Jack published in Science found that M-Pesa lifted approximately 194,000 households (2% of Kenyan households) out of extreme poverty. The effect was driven primarily by female-headed households.

### Remittances

Before M-Pesa, sending money from Nairobi to a rural village involved:
- Travel time: 4-8 hours by bus
- Transaction cost: 15-25% through informal channels
- Risk: Cash could be lost or stolen in transit

M-Pesa reduced transaction costs to 1-3% and transfer time to seconds. This freed up income for food, education, and healthcare.

## Beyond Payments: The Ecosystem Effect

Mobile money created a platform for other financial services:

### M-Shwari (Micro-Loans)

Launched in 2012, M-Shwari offers instant loans based on M-Pesa transaction history. No paperwork, no collateral. Interest rates are high (7.5% per month), but the accessibility is unprecedented.

A 2018 study found that M-Shwari loans increased household consumption by 18% and business investment by 20%.

### KCB M-Pesa (Savings & Loans)

Kenya Commercial Bank partnered with Safaricom to offer savings accounts and larger loans through M-Pesa. Users earn interest on savings and can access credit up to KES 1 million.

### Insurance

Platforms like Bima and M-Tiba offer micro-insurance products through mobile money. Health insurance premiums as low as $0.50/month are now available.

## Challenges and Criticisms

### Agent Liquidity

M-Pesa agents sometimes run out of cash, especially in rural areas during peak periods. This creates "float management" challenges that can leave users unable to withdraw.

### Transaction Fraud

SIM swap fraud and social engineering attacks have increased. Between 2020 and 2023, M-Pesa fraud cases increased by 40%, according to the Central Bank of Kenya.

### Digital Literacy

Older populations and those with limited education struggle with mobile money interfaces. USSD menus can be confusing, and errors are difficult to reverse.

### Over-Indebtedness

Easy access to micro-loans has led to over-indebtedness for some users. The average Kenyan has 3-4 active mobile loan obligations simultaneously.

## What Other Countries Can Learn

### Infrastructure First

Mobile money succeeds where there's agent network density. Kenya had 160,000 M-Pesa agents by 2010 — more than all bank branches in East Africa combined.

### Regulatory Balance

Kenya's Central Bank took a light-touch approach initially, allowing innovation before regulation. Other countries that over-regulated early (e.g., Nigeria) saw slower adoption.

### Interoperability

Allowing mobile money to work across different providers and with bank accounts multiplies the network effect. Tanzania's inter-operability framework led to faster growth than countries with siloed systems.

## Key Takeaways

- Mobile money has been the single most important driver of financial inclusion in East Africa
- M-Pesa lifted approximately 194,000 Kenyan households out of extreme poverty
- The platform reduced remittance costs from 15-25% to 1-3%
- Gender gap in financial access narrowed significantly
- Challenges remain: fraud, over-indebtedness, agent liquidity, digital literacy
- Other developing countries can learn from Kenya's regulatory and infrastructure approach

## References

- Suri, T., & Jack, W. (2016). The long-run poverty and gender impacts of mobile money. Science, 354(6317), 1288-1292.
- World Bank (2021). Global Findex Database.
- Central Bank of Kenya (2023). National Payment System Survey.
- GSMA (2023). State of the Industry Report on Mobile Money.`,
    category: 'research',
    tags: ['research', 'mobile money', 'M-Pesa', 'financial inclusion', 'East Africa', 'development economics'],
    read_time: 12,
    status: 'published',
    featured: false,

    created_at: '2026-06-15T10:00:00Z',
    published_at: '2026-06-15T10:00:00Z',
  },

  // ─── Technical Guide ───────────────────────────────────────────
  {
    title: 'Building a Full-Stack App with Supabase and Next.js',
    slug: 'building-full-stack-app-supabase-nextjs',
    excerpt: 'A practical guide to setting up Supabase as your backend with Next.js — from authentication to real-time databases.',
    content: `## Why Supabase?

Supabase is an open-source alternative to Firebase that provides a PostgreSQL database, authentication, real-time subscriptions, and storage. Combined with Next.js, it gives you a full-stack setup with minimal configuration.

## Setting Up

### Create a Supabase Project

1. Go to supabase.com and create an account
2. Click "New Project" and choose a database password
3. Note your project URL and anon key from Settings > API

### Install Dependencies

\`\`\`bash
npm install @supabase/supabase-js
npm install @supabase/ssr
\`\`\`

### Create the Client

\`\`\`typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
\`\`\`

## Authentication

### Email/Password Auth

\`\`\`typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword',
})
\`\`\`

### Social Login (Google)

\`\`\`typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: \`\${window.location.origin}/auth/callback\`,
  },
})
\`\`\`

### Protecting Routes with Middleware

\`\`\`typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next()
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}
\`\`\`

## Database Queries

### Fetching Data

\`\`\`typescript
// Get all articles
const { data, error } = await supabase
  .from('articles')
  .select('*')
  .order('created_at', { ascending: false })

// Filter by category
const { data, error } = await supabase
  .from('articles')
  .select('*')
  .eq('category', 'economics')

// Full-text search
const { data, error } = await supabase
  .from('articles')
  .select('*')
  .textSearch('title', 'inflation')
\`\`\`

### Inserting Data

\`\`\`typescript
const { data, error } = await supabase
  .from('articles')
  .insert({
    title: 'My New Article',
    content: 'Article content here...',
    category: 'economics',
    status: 'published',
  })
  .select()
  .single()
\`\`\`

### Updating Data

\`\`\`typescript
const { data, error } = await supabase
  .from('articles')
  .update({ title: 'Updated Title' })
  .eq('id', 'article-id')
  .select()
  .single()
\`\`\`

## Real-Time Subscriptions

\`\`\`typescript
const channel = supabase
  .channel('articles-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'articles' },
    (payload) => {
      console.log('Change detected:', payload)
      // Update your UI with the new data
    }
  )
  .subscribe()
\`\`\`

## Row Level Security (RLS)

RLS is Supabase's way of controlling who can access what data. Without RLS enabled, anyone with your anon key can read/write all data.

### Basic RLS Policies

\`\`\`sql
-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Anyone can read published articles
CREATE POLICY "Public read access" ON articles
  FOR SELECT USING (published = true);

-- Only authenticated users can insert
CREATE POLICY "Auth insert access" ON articles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can only update their own articles
CREATE POLICY "Own article update" ON articles
  FOR UPDATE USING (auth.uid() = author_id);
\`\`\`

## Deploying to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Deploy

Vercel automatically detects Next.js and configures the build. Supabase works seamlessly because it's a hosted service — no server setup needed.

## Key Takeaways

- Supabase provides PostgreSQL, auth, real-time, and storage
- Use @supabase/ssr for server-side rendering with Next.js
- Always enable RLS in production
- Supabase's JavaScript client works in both browser and server
- Deploy to Vercel with zero configuration`,
    category: 'technical',
    tags: ['Supabase', 'Next.js', 'full-stack', 'web development', 'tutorial'],
    read_time: 11,
    status: 'published',
    featured: false,

    created_at: '2026-06-16T10:00:00Z',
    published_at: '2026-06-16T10:00:00Z',
  },
]

async function seed() {
  console.log('Seeding articles...')

  // First, delete all existing articles by selecting all ids then deleting
  const { data: existing } = await supabase.from('articles').select('id')
  if (existing && existing.length > 0) {
    const ids = existing.map(a => a.id)
    const { error: deleteError } = await supabase.from('articles').delete().in('id', ids)
    if (deleteError) {
      console.error('Delete error:', deleteError)
      return
    }
  }
  console.log('Cleared existing articles.')

  // Insert new articles
  for (const article of articles) {
    const { error } = await supabase.from('articles').insert(article)
    if (error) {
      console.error(`Error inserting "${article.title}":`, error)
    } else {
      console.log(`  ✓ ${article.title} (${article.category})`)
    }
  }

  console.log(`\nDone! Seeded ${articles.length} articles.`)
}

seed()
