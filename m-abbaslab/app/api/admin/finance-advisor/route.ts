import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_abbaslab_2026_change_in_production'
)

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const header = request.headers.get('x-admin-secret')
  if (process.env.ADMIN_SECRET && header === process.env.ADMIN_SECRET) return true
  const session = request.cookies.get('admin_session')
  if (!session?.value) return false
  try { await jwtVerify(session.value, JWT_SECRET); return true } catch { return false }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthorized(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { transactions, pdfText } = body

    if ((!transactions || !Array.isArray(transactions)) && !pdfText) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Mock an AI response delay
    await new Promise(resolve => setTimeout(resolve, 2500))

    let advice = `Based on my analysis of your statement:\n\n`
    
    if (pdfText) {
      advice += `> **Note:** A PDF Bank Statement was analyzed.\n\n`
      // Basic mock extraction of numbers from the text
      const numbers = pdfText.match(/\d+(,\d{3})*(\.\d{2})?/g) || []
      if (numbers.length > 0) {
        advice += `1. **Extracted Activity:** Found several transaction patterns from the PDF text. The largest detected value was KSh ${numbers.sort((a:string,b:string) => parseFloat(b.replace(/,/g,'')) - parseFloat(a.replace(/,/g,'')))[0]}.\n`
        advice += `2. **Insights:** The unstructured data suggests recurring expenses that need categorization.\n`
      } else {
        advice += `1. **Scan Complete:** The uploaded document was analyzed but no clear financial values were extracted.\n`
      }
    } else {
      // Simple analytical heuristics for the mock AI using JSON transactions
      const totalIncome = transactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + t.amount, 0)
      const totalExpense = transactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + t.amount, 0)
      
      // Check categories
      const categories: Record<string, number> = {}
      transactions.filter((t: any) => t.type === 'expense').forEach((t: any) => {
        categories[t.category] = (categories[t.category] || 0) + t.amount
      })
      const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1])
      const topExpense = sortedCategories.length > 0 ? sortedCategories[0][0] : 'Unknown'

      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0

      advice += `1. **Cash Flow Summary:** You brought in KSh ${Math.round(totalIncome).toLocaleString()} and spent KSh ${Math.round(totalExpense).toLocaleString()}.\n`
      
      if (savingsRate < 20) {
        advice += `2. **Savings Warning:** Your savings rate is only ${savingsRate.toFixed(1)}%. You are violating the "Pay Yourself First" rule. Target at least 20%.\n`
      } else {
        advice += `2. **Savings Excellent:** Your savings rate is ${savingsRate.toFixed(1)}%. You are safely adhering to wealth-building principles.\n`
      }

      advice += `3. **Expense Leak:** Your highest expense category is **${topExpense}**. Apply the "Latte Factor" rule to trim unnecessary outflows here.\n`
    }

    advice += `\n**System Recommendation:** Review the 50/30/20 rule and cut back on depreciating liabilities.`

    return NextResponse.json({ success: true, advice })
  } catch (error) {
    return NextResponse.json({ error: 'Advisor failed' }, { status: 500 })
  }
}
