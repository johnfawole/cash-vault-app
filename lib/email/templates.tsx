'use server'

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

// Plan Created Email
export function getPlanCreatedEmailText(data: PlanCreatedEmailData): string {
  return `
Hi ${data.recipientName},

Your DCA plan has been successfully created!

Plan Details:
- Asset: ${data.assetSymbol}
- Plan ID: ${data.planId}
- Created: ${data.createdDate}

You can now fund your plan and start your dollar-cost averaging investment journey.

Visit your dashboard to manage your plan: https://cashvault.com/dashboard

Best regards,
John at CashVault
`.trim()
}

export function getPlanCreatedEmailHtml(data: PlanCreatedEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #c4fa6b 0%, #00d9ff 100%); padding: 30px; border-radius: 8px; color: #0a1628; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .btn { display: inline-block; background: #c4fa6b; color: #0a1628; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Plan Created Successfully!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.recipientName},</p>
      <p>Your DCA plan has been successfully created!</p>
      <h3>Plan Details</h3>
      <ul>
        <li><strong>Asset:</strong> ${data.assetSymbol}</li>
        <li><strong>Plan ID:</strong> ${data.planId}</li>
        <li><strong>Created:</strong> ${data.createdDate}</li>
      </ul>
      <p>You can now fund your plan and start your dollar-cost averaging investment journey.</p>
      <center>
        <a href="https://cashvault.com/dashboard" class="btn">Go to Dashboard</a>
      </center>
    </div>
    <div class="footer">
      <p>Best regards,<br>John at CashVault</p>
    </div>
  </div>
</body>
</html>
`.trim()
}

// Plan Funded Email
export function getPlanFundedEmailText(data: PlanFundedEmailData): string {
  return `
Hi ${data.recipientName},

Your plan has been successfully funded!

Transaction Details:
- Asset: ${data.assetSymbol}
- Amount Deposited: ${data.amountDeposited}
- New Balance: ${data.newBalance}
- Plan ID: ${data.planId}
- Date: ${data.transactionDate}

Your investment plan is now active and growing. You can manage your plan at any time through your dashboard.

Visit your dashboard: https://cashvault.com/dashboard

Best regards,
John at CashVault
`.trim()
}

export function getPlanFundedEmailHtml(data: PlanFundedEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #00d9ff 0%, #c4fa6b 100%); padding: 30px; border-radius: 8px; color: #0a1628; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .btn { display: inline-block; background: #00d9ff; color: #0a1628; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Plan Funded!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.recipientName},</p>
      <p>Your plan has been successfully funded!</p>
      <h3>Transaction Details</h3>
      <ul>
        <li><strong>Asset:</strong> ${data.assetSymbol}</li>
        <li><strong>Amount Deposited:</strong> ${data.amountDeposited}</li>
        <li><strong>New Balance:</strong> ${data.newBalance}</li>
        <li><strong>Plan ID:</strong> ${data.planId}</li>
        <li><strong>Date:</strong> ${data.transactionDate}</li>
      </ul>
      <p>Your investment plan is now active and growing. You can manage your plan at any time through your dashboard.</p>
      <center>
        <a href="https://cashvault.com/dashboard" class="btn">View Plan</a>
      </center>
    </div>
    <div class="footer">
      <p>Best regards,<br>John at CashVault</p>
    </div>
  </div>
</body>
</html>
`.trim()
}

// Plan Withdrawn Email
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

Your remaining balance is still earning returns. Continue managing your plan through your dashboard.

Visit your dashboard: https://cashvault.com/dashboard

Best regards,
John at CashVault
`.trim()
}

export function getPlanWithdrawnEmailHtml(data: PlanWithdrawnEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #c4fa6b 0%, #ff6b6b 100%); padding: 30px; border-radius: 8px; color: #0a1628; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .btn { display: inline-block; background: #c4fa6b; color: #0a1628; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Withdrawal Processed!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.recipientName},</p>
      <p>Your withdrawal has been processed successfully!</p>
      <h3>Withdrawal Details</h3>
      <ul>
        <li><strong>Asset:</strong> ${data.assetSymbol}</li>
        <li><strong>Amount Withdrawn:</strong> ${data.amountWithdrawn}</li>
        <li><strong>Remaining Balance:</strong> ${data.remainingBalance}</li>
        <li><strong>Plan ID:</strong> ${data.planId}</li>
        <li><strong>Date:</strong> ${data.withdrawalDate}</li>
      </ul>
      <p>Your remaining balance is still earning returns. Continue managing your plan through your dashboard.</p>
      <center>
        <a href="https://cashvault.com/dashboard" class="btn">Manage Plan</a>
      </center>
    </div>
    <div class="footer">
      <p>Best regards,<br>John at CashVault</p>
    </div>
  </div>
</body>
</html>
`.trim()
}
