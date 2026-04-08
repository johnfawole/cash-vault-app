export interface PlanCreatedEmailData {
  recipientName: string
  assetSymbol: string
  planId: number
  createdDate: string
}

export interface PlanFundedEmailData {
  recipientName: string
  assetSymbol: string
  amountDeposited: number
  newBalance: number
  planId: number
  transactionDate: string
}

export interface PlanWithdrawnEmailData {
  recipientName: string
  assetSymbol: string
  amountWithdrawn: number
  remainingBalance: number
  planId: number
  withdrawalDate: string
}

export function getPlanCreatedEmailText(data: PlanCreatedEmailData): string {
  return `
Hi ${data.recipientName},

Your DCA plan for ${data.assetSymbol} has been created successfully!

Plan Details:
- Asset: ${data.assetSymbol}
- Plan ID: ${data.planId}
- Created: ${data.createdDate}

Your plan is now active. You can start funding it whenever you're ready.

Visit your dashboard to manage your plan: https://cashvault.app/dashboard

Best regards,
The CashVault Team
  `.trim()
}

export function getPlanCreatedEmailHtml(data: PlanCreatedEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #c4fa6b 0%, #a8d83f 100%); padding: 20px; border-radius: 8px 8px 0 0; }
    .header h1 { color: #0a1628; margin: 0; font-size: 24px; }
    .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
    .details { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #c4fa6b; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; }
    .label { font-weight: 600; color: #666; }
    .value { color: #0a1628; }
    .button { display: inline-block; background: #c4fa6b; color: #0a1628; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { color: #999; font-size: 12px; text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Plan Created Successfully</h1>
    </div>
    <div class="content">
      <p>Hi ${data.recipientName},</p>
      <p>Your DCA plan for <strong>${data.assetSymbol}</strong> has been created successfully!</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="label">Asset:</span>
          <span class="value">${data.assetSymbol}</span>
        </div>
        <div class="detail-row">
          <span class="label">Plan ID:</span>
          <span class="value">#${data.planId}</span>
        </div>
        <div class="detail-row">
          <span class="label">Created:</span>
          <span class="value">${data.createdDate}</span>
        </div>
      </div>

      <p>Your plan is now active. You can start funding it whenever you're ready.</p>
      
      <a href="https://cashvault.app/dashboard" class="button">Go to Dashboard</a>
      
      <p style="color: #999; font-size: 14px;">Questions? Contact support@cashvault.app</p>
    </div>
    <div class="footer">
      <p>© 2026 CashVault. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export function getPlanFundedEmailText(data: PlanFundedEmailData): string {
  return `
Hi ${data.recipientName},

Your DCA plan has been funded successfully!

Transaction Details:
- Asset: ${data.assetSymbol}
- Amount Deposited: ${data.amountDeposited}
- New Balance: ${data.newBalance}
- Plan ID: ${data.planId}
- Date: ${data.transactionDate}

Your funds are now working towards your investment goal.

Track your progress: https://cashvault.app/dashboard

Best regards,
The CashVault Team
  `.trim()
}

export function getPlanFundedEmailHtml(data: PlanFundedEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #c4fa6b 0%, #a8d83f 100%); padding: 20px; border-radius: 8px 8px 0 0; }
    .header h1 { color: #0a1628; margin: 0; font-size: 24px; }
    .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
    .details { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #c4fa6b; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; }
    .label { font-weight: 600; color: #666; }
    .value { color: #0a1628; }
    .highlight { font-weight: 600; color: #c4fa6b; font-size: 16px; }
    .button { display: inline-block; background: #c4fa6b; color: #0a1628; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { color: #999; font-size: 12px; text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Plan Funded</h1>
    </div>
    <div class="content">
      <p>Hi ${data.recipientName},</p>
      <p>Your DCA plan has been funded successfully! Your investment is now active.</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="label">Asset:</span>
          <span class="value">${data.assetSymbol}</span>
        </div>
        <div class="detail-row">
          <span class="label">Amount Deposited:</span>
          <span class="highlight">+${data.amountDeposited}</span>
        </div>
        <div class="detail-row">
          <span class="label">New Balance:</span>
          <span class="value">${data.newBalance}</span>
        </div>
        <div class="detail-row">
          <span class="label">Plan ID:</span>
          <span class="value">#${data.planId}</span>
        </div>
        <div class="detail-row">
          <span class="label">Date:</span>
          <span class="value">${data.transactionDate}</span>
        </div>
      </div>

      <p>Your funds are now working towards your investment goal. Check your dashboard to track your progress.</p>
      
      <a href="https://cashvault.app/dashboard" class="button">View Dashboard</a>
      
      <p style="color: #999; font-size: 14px;">Questions? Contact support@cashvault.app</p>
    </div>
    <div class="footer">
      <p>© 2026 CashVault. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export function getPlanWithdrawnEmailText(data: PlanWithdrawnEmailData): string {
  return `
Hi ${data.recipientName},

Your withdrawal has been processed successfully!

Withdrawal Details:
- Asset: ${data.assetSymbol}
- Amount Withdrawn: ${data.amountWithdrawn}
- Remaining Balance: ${data.remainingBalance}
- Plan ID: ${data.planId}
- Date: ${data.withdrawalDate}

Your funds have been transferred to your wallet.

Manage your plans: https://cashvault.app/dashboard

Best regards,
The CashVault Team
  `.trim()
}

export function getPlanWithdrawnEmailHtml(data: PlanWithdrawnEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #c4fa6b 0%, #a8d83f 100%); padding: 20px; border-radius: 8px 8px 0 0; }
    .header h1 { color: #0a1628; margin: 0; font-size: 24px; }
    .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
    .details { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #c4fa6b; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; }
    .label { font-weight: 600; color: #666; }
    .value { color: #0a1628; }
    .highlight { font-weight: 600; color: #ff6b6b; font-size: 16px; }
    .button { display: inline-block; background: #c4fa6b; color: #0a1628; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { color: #999; font-size: 12px; text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Withdrawal Completed</h1>
    </div>
    <div class="content">
      <p>Hi ${data.recipientName},</p>
      <p>Your withdrawal has been processed successfully! Your funds have been transferred to your wallet.</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="label">Asset:</span>
          <span class="value">${data.assetSymbol}</span>
        </div>
        <div class="detail-row">
          <span class="label">Amount Withdrawn:</span>
          <span class="highlight">-${data.amountWithdrawn}</span>
        </div>
        <div class="detail-row">
          <span class="label">Remaining Balance:</span>
          <span class="value">${data.remainingBalance}</span>
        </div>
        <div class="detail-row">
          <span class="label">Plan ID:</span>
          <span class="value">#${data.planId}</span>
        </div>
        <div class="detail-row">
          <span class="label">Date:</span>
          <span class="value">${data.withdrawalDate}</span>
        </div>
      </div>

      <p>Your withdrawal is complete. The funds are now in your wallet.</p>
      
      <a href="https://cashvault.app/dashboard" class="button">View Your Plans</a>
      
      <p style="color: #999; font-size: 14px;">Questions? Contact support@cashvault.app</p>
    </div>
    <div class="footer">
      <p>© 2026 CashVault. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
