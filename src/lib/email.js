import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email, name, verificationToken) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`
  
  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'CC AI Agent <onboarding@resend.dev>',
      to: [email],
      subject: 'Verify your email address',
      html: getVerificationEmailTemplate(name, verificationUrl)
    })
    
    return { success: true, data }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return { success: false, error: error.message }
  }
}

export async function sendWelcomeEmail(email, name) {
  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'CC AI Agent <onboarding@resend.dev>',
      to: [email],
      subject: 'Welcome to CC AI Agent!',
      html: getWelcomeEmailTemplate(name)
    })
    
    return { success: true, data }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error: error.message }
  }
}

export async function sendConfirmationEmail(email, name) {
  console.log(`[EMAIL] Attempting to send confirmation email to: ${email}`)
  console.log(`[EMAIL] FROM_EMAIL env var: ${process.env.FROM_EMAIL || 'not set'}`)
  console.log(`[EMAIL] RESEND_API_KEY configured: ${process.env.RESEND_API_KEY ? 'yes' : 'no'}`)
  
  try {
    const emailData = {
      from: process.env.FROM_EMAIL || 'CC AI Agent <onboarding@resend.dev>',
      to: [email],
      subject: 'Welcome to CC AI Agent - Account Created!',
      html: getConfirmationEmailTemplate(name)
    }
    
    console.log(`[EMAIL] Sending email with config:`, {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject
    })
    
    const data = await resend.emails.send(emailData)
    
    console.log(`[EMAIL] Resend response:`, data)
    return { success: true, data }
  } catch (error) {
    console.error('[EMAIL] Error sending confirmation email:', error)
    console.error('[EMAIL] Error details:', error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

function getVerificationEmailTemplate(name, verificationUrl) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .container {
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            .content {
                padding: 30px 20px;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                padding: 12px 30px;
                border-radius: 6px;
                margin: 20px 0;
                font-weight: 600;
            }
            .footer {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                font-size: 14px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to CC AI Agent!</h1>
            </div>
            <div class="content">
                <h2>Hi ${name || 'there'}!</h2>
                <p>Thanks for signing up with CC AI Agent. To complete your registration, please verify your email address by clicking the button below:</p>
                
                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                
                <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
                
                <p>This verification link will expire in 24 hours for security reasons.</p>
                
                <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 CC AI Agent. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `
}

function getWelcomeEmailTemplate(name) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome!</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .container {
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            .content {
                padding: 30px 20px;
            }
            .footer {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                font-size: 14px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to CC AI Agent!</h1>
            </div>
            <div class="content">
                <h2>Hi ${name || 'there'}!</h2>
                <p>Your email has been successfully verified and your account is now active!</p>
                
                <p>You can now enjoy all the features of CC AI Agent:</p>
                <ul>
                    <li>AI-powered chat assistance</li>
                    <li>Advanced search capabilities</li>
                    <li>Personalized recommendations</li>
                    <li>And much more!</li>
                </ul>
                
                <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
                
                <p>Happy exploring!</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 CC AI Agent. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `
}

function getConfirmationEmailTemplate(name) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Created Successfully!</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🎉 Welcome to CC AI Agent!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your account has been successfully created</p>
            </div>
            <div style="padding: 40px 30px;">
                <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Hi ${name || 'there'}!</h2>
                <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">Great news! Your CC AI Agent account has been successfully created using your Google account. You're all set to start exploring our AI-powered features.</p>
                
                <div style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                    <h3 style="margin: 0 0 15px 0; color: #667eea; font-size: 18px;">🚀 What you can do now:</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #555;">
                        <li style="margin: 8px 0;">Chat with our advanced AI assistant</li>
                        <li style="margin: 8px 0;">Access intelligent search capabilities</li>
                        <li style="margin: 8px 0;">Get personalized recommendations</li>
                        <li style="margin: 8px 0;">Explore all premium features</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXTAUTH_URL || 'https://your-domain.com'}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3); transition: transform 0.2s;">Get Started</a>
                </div>
                
                <p style="margin: 25px 0 0 0; font-size: 14px; color: #666; text-align: center;">Since you signed up with Google, your email is already verified and you can start using all features immediately.</p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="margin: 0; font-size: 14px; color: #888; text-align: center;">Need help? Contact our support team or visit our help center.</p>
            </div>
            <div style="background: #f8f9fa; padding: 25px 20px; text-align: center; border-top: 1px solid #eee;">
                <p style="margin: 0; font-size: 14px; color: #666;">&copy; 2024 CC AI Agent. All rights reserved.</p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">This email was sent because you created an account with CC AI Agent.</p>
            </div>
        </div>
    </body>
    </html>
  `
}