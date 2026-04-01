/**
 * Email templates for DCA plan milestones
 */

export interface PlanCreatedEmailData {
  recipientName: string
  assetSymbol: string
  planId: number
  createdDate: string
  dashboardUrl: string
}

export interface PlanFundedEmailData {
  recipientName: string
  assetSymbol: string
  amountDeposited: number
  newBalance: number
  planId: number
  transactionDate: string
  dashboardUrl: string
}

export interface PlanWithdrawnEmailData {
  recipientName: string
  assetSymbol: string
  amountWithdrawn: number
  remainingBalance: number
  planId: number
  withdrawalDate: string
  dashboardUrl: string
}

// Plan Created Email
export function getPlanCreatedEmailText(data: PlanCreatedEmailData): string {
  return `Hi ${data.recipientName},

Your DCA plan has been successfully created!

Plan Details:
- Asset: ${data.assetSymbol}
- Plan ID: ${data.planId}
- Created: ${data.createdDate}

You can now start funding your plan to begin your Dollar Cost Averaging strategy.

Get started: ${data.dashboardUrl}

Best regards,
CashVault Team`
}

export function getPlanCreatedEmailHtml(data: PlanCreatedEmailData): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
    .content { padding: 20px 0; }
    .details { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .label { font-weight: bold; }
    .cta { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
    .footer { color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DCA Plan Created! 🎉</h1>
    </div>
    <div class="content">
      <p>Hi ${data.recipientName},</p>
      <p>Your DCA plan has been successfully created! You're all set to start your Dollar Cost Averaging investment strategy.</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="label">Asset:</span>
          <span>${data.assetSymbol}</span>
        </div>
        <div class="detail-row">
          <span class="label">Plan ID:</span>
          <span>${data.planId}</span>
        </div>
        <div class="detail-row">
          <span class="label">Created:</span>
          <span>${data.createdDate}</span>
        </div>
      </div>
      
      <p>You can now start funding your plan to begin your investment journey.</p>
      <a href="${data.dashboardUrl}" class="cta">Go to Dashboard</a>
      
      <p>If you have any questions, feel free to reach out to our support team.</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 CashVault. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
}

// Plan Funded Email
export function getPlanFundedEmailText(data: PlanFundedEmailData): string {
  return `Hi ${data.recipientName},

Your DCA plan has been funded successfully!

Funding Details:
- Asset: ${data.assetSymbol}
- Amount Deposited: ${data.amountDeposited} USD
- New Balance: ${data.newBalance} USD
- Plan ID: ${data.planId}
- Transaction Date: ${data.transactionDate}

Your DCA plan is now active and working for you.

View your plan: ${data.dashboardUrl}

Best regards,
CashVault Team`
}

export function getPlanFundedEmailHtml(data: PlanFundedEmailData): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; border-radius: 8px; }
    .content { padding: 20px 0; }
    .details { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .label { font-weight: bold; }
    .amount { font-size: 24px; font-weight: bold; color: #38ef7d; }
    .cta { display: inline-block; background: #38ef7d; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
    .footer { color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Plan Funded Successfully! 💰</h1>
    </div>
    <div class="content">
      <p>Hi ${data.recipientName},</p>
      <p>Great news! Your DCA plan has been funded and is now active.</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="label">Asset:</span>
          <span>${data.assetSymbol}</span>
        </div>
        <div class="detail-row">
          <span class="label">Amount Deposited:</span>
          <span class="amount">$${data.amountDeposited.toFixed(2)}</span>
        </div>
        <div class="detail-row">
          <span class="label">New Balance:</span>
          <span>$${data.newBalance.toFixed(2)}</span>
        </div>
        <div class="detail-row">
          <span class="label">Plan ID:</span>
          <span>${data.planId}</span>
        </div>
        <div class="detail-row">
          <span class="label">Transaction Date:</span>
          <span>${data.transactionDate}</span>
        </div>
      </div>
      
      <p>Your DCA strategy is now working for you! Check your dashboard to monitor your investments.</p>
      <a href="${data.dashboardUrl}" class="cta">View Dashboard</a>
    </div>
    <div class="footer">
      <p>&copy; 2024 CashVault. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
}

// Plan Withdrawn Email
export function getPlanWithdrawnEmailText(data: PlanWithdrawnEmailData): string {
  return `Hi ${data.recipientName},

Your withdrawal has been processed successfully!

Withdrawal Details:
- Asset: ${data.assetSymbol}
- Amount Withdrawn: ${data.amountWithdrawn} USD
- Remaining Balance: ${data.remainingBalance} USD
- Plan ID: ${data.planId}
- Withdrawal Date: ${data.withdrawalDate}

Your funds have been transferred to your wallet.

View your plan: ${data.dashboardUrl}

Best regards,
CashVault Team`
}

export function getPlanWithdrawnEmailHtml(data: PlanWithdrawnEmailData): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 8px; }
    .content { padding: 20px 0; }
    .details { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .label { font-weight: bold; }
    .amount { font-size: 24px; font-weight: bold; color: #f5576c; }
    .cta { display: inline-block; background: #f5576c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
    .footer { color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Withdrawal Processed! ✓</h1>
    </div>
    <div class="content">
      <p>Hi ${data.recipientName},</p>
      <p>Your withdrawal has been successfully processed and your funds are on their way to your wallet.</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="label">Asset:</span>
          <span>${data.assetSymbol}</span>
        </div>
        <div class="detail-row">
          <span class="label">Amount Withdrawn:</span>
          <span class="amount">$${data.amountWithdrawn.toFixed(2)}</span>
        </div>
        <div class="detail-row">
          <span class="label">Remaining Balance:</span>
          <span>$${data.remainingBalance.toFixed(2)}</span>
        </div>
        <div class="detail-row">
          <span class="label">Plan ID:</span>
          <span>${data.planId}</span>
        </div>
        <div class="detail-row">
          <span class="label">Withdrawal Date:</span>
          <span>${data.withdrawalDate}</span>
        </div>
      </div>
      
      <p>You can continue your DCA strategy or manage your plan from your dashboard.</p>
      <a href="${data.dashboardUrl}" class="cta">View Dashboard</a>
    </div>
    <div class="footer">
      <p>&copy; 2024 CashVault. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
}
