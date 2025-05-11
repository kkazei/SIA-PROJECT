export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - RentFlow</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; margin: 0; padding: 0; border: none;">
    <tr>
      <td style="padding: 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="/frontend/public/image/Logo.png" alt="RentFlow Logo" style="height: 40px; margin-bottom: 10px;">
        </div>
        
        <!-- Main Content -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 2px; border-radius: 16px;">
          <div style="background-color: white; border-radius: 14px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <h1 style="color: #1e3a8a; font-size: 24px; margin: 0 0 20px; text-align: center; font-weight: 700;">Email Verification</h1>
            
            <p style="color: #64748b; margin-bottom: 25px; text-align: center;">Thank you for signing up with RentFlow! To complete your registration, please verify your email using the code below:</p>
            
            <div style="text-align: center; margin: 30px 0; background-color: #f1f5f9; border-radius: 12px; padding: 20px; border: 1px dashed #cbd5e1;">
              <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1e40af; font-family: monospace;">{verificationCode}</span>
            </div>
            
            <p style="color: #64748b; text-align: center;">This verification code will expire in 15 minutes.</p>
            
            <div style="margin: 30px 0; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #94a3b8; font-size: 14px;">If you did not sign up for RentFlow, please disregard this email.</p>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 25px; color: #94a3b8; font-size: 13px;">
          <p>&copy; ${new Date().getFullYear()} RentFlow. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful - RentFlow</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; margin: 0; padding: 0; border: none;">
    <tr>
      <td style="padding: 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://i.ibb.co/TLXwBZD/rentflow-logo.png" alt="RentFlow Logo" style="height: 40px; margin-bottom: 10px;">
        </div>
        
        <!-- Main Content -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 2px; border-radius: 16px;">
          <div style="background-color: white; border-radius: 14px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <h1 style="color: #1e3a8a; font-size: 24px; margin: 0 0 20px; text-align: center; font-weight: 700;">Password Reset Successful</h1>
            
            <!-- Success Icon -->
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background-color: #ecfdf5; width: 80px; height: 80px; line-height: 80px; border-radius: 50%; border: 2px solid #10b981; font-size: 40px; color: #10b981;">
                ✓
              </div>
            </div>
            
            <p style="color: #64748b; margin-bottom: 25px; text-align: center;">Your password has been successfully reset. You can now log in to your RentFlow account with your new password.</p>
            
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-top: 25px; border-left: 4px solid #1e40af;">
              <h3 style="color: #1e3a8a; margin-top: 0; font-size: 16px;">Security Tips</h3>
              <ul style="color: #64748b; padding-left: 20px; margin-bottom: 0;">
                <li style="margin-bottom: 10px;">Use a strong, unique password with a mix of letters, numbers, and symbols</li>
                <li style="margin-bottom: 10px;">Don't reuse passwords across multiple websites</li>
                <li style="margin-bottom: 10px;">Consider enabling two-factor authentication for added security</li>
              </ul>
            </div>
            
            <div style="margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #94a3b8; font-size: 14px;">If you did not request this password reset, please contact our support team immediately.</p>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 25px; color: #94a3b8; font-size: 13px;">
          <p>&copy; ${new Date().getFullYear()} RentFlow. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - RentFlow</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; margin: 0; padding: 0; border: none;">
    <tr>
      <td style="padding: 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://i.ibb.co/TLXwBZD/rentflow-logo.png" alt="RentFlow Logo" style="height: 40px; margin-bottom: 10px;">
        </div>
        
        <!-- Main Content -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 2px; border-radius: 16px;">
          <div style="background-color: white; border-radius: 14px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <h1 style="color: #1e3a8a; font-size: 24px; margin: 0 0 20px; text-align: center; font-weight: 700;">Reset Your Password</h1>
            
            <p style="color: #64748b; margin-bottom: 25px; text-align: center;">We received a request to reset your password for your RentFlow account. Please click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="{resetURL}" style="display: inline-block; background: linear-gradient(to right, #1e40af, #3b82f6); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25); transition: all 0.3s ease;">Reset Password</a>
            </div>
            
            <p style="color: #64748b; text-align: center; margin-bottom: 25px;">This link will expire in 1 hour.</p>
            
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 15px; margin-top: 25px;">
              <p style="color: #64748b; margin: 0; font-size: 14px;">If the button above doesn't work, copy and paste the following URL into your browser:</p>
              <p style="word-break: break-all; font-size: 12px; color: #6b7280; margin-top: 10px; font-family: monospace; background: #f1f5f9; padding: 10px; border-radius: 6px;">{resetURL}</p>
            </div>
            
            <div style="margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #94a3b8; font-size: 14px;">If you didn't request a password reset, please ignore this email or contact support if you're concerned.</p>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 25px; color: #94a3b8; font-size: 13px;">
          <p>&copy; ${new Date().getFullYear()} RentFlow. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to RentFlow</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; margin: 0; padding: 0; border: none;">
    <tr>
      <td style="padding: 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://i.ibb.co/TLXwBZD/rentflow-logo.png" alt="RentFlow Logo" style="height: 40px; margin-bottom: 10px;">
        </div>
        
        <!-- Main Content -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 2px; border-radius: 16px;">
          <div style="background-color: white; border-radius: 14px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <h1 style="color: #1e3a8a; font-size: 24px; margin: 0 0 20px; text-align: center; font-weight: 700;">Welcome to RentFlow!</h1>
            
            <!-- Welcome Image -->
            <div style="text-align: center; margin: 30px 0;">
              <img src="https://i.ibb.co/1MWVkFw/welcome-building.png" alt="Welcome" style="max-width: 200px; border-radius: 10px;">
            </div>
            
            <p style="color: #64748b; margin-bottom: 20px;">Hello {username},</p>
            
            <p style="color: #64748b; margin-bottom: 20px;">Thank you for joining RentFlow - your comprehensive solution for apartment rental management!</p>
            
            <p style="color: #64748b; margin-bottom: 20px;">With RentFlow, you can:</p>
            
            <ul style="color: #64748b; padding-left: 25px;">
              <li style="margin-bottom: 10px;">Browse available apartments</li>
              <li style="margin-bottom: 10px;">Apply for units that fit your needs</li>
              <li style="margin-bottom: 10px;">Track application status</li>
              <li style="margin-bottom: 10px;">Pay rent online</li>
              <li style="margin-bottom: 10px;">Submit maintenance requests</li>
            </ul>
            
            <div style="text-align: center; margin: 35px 0 25px;">
              <a href="https://rentflow.com/login" style="display: inline-block; background: linear-gradient(to right, #1e40af, #3b82f6); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25); transition: all 0.3s ease;">Go to Dashboard</a>
            </div>
            
            <div style="margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin-bottom: 10px;">If you have any questions or need assistance, don't hesitate to contact our support team.</p>
              <p style="color: #64748b; margin-bottom: 5px;">Best regards,</p>
              <p style="color: #1e40af; font-weight: 600; margin-top: 0;">The RentFlow Team</p>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 25px; color: #94a3b8; font-size: 13px;">
          <p>&copy; ${new Date().getFullYear()} RentFlow. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
          <div style="margin-top: 15px;">
            <a href="#" style="color: #3b82f6; margin: 0 10px; text-decoration: none;">Privacy Policy</a>
            <a href="#" style="color: #3b82f6; margin: 0 10px; text-decoration: none;">Terms of Service</a>
            <a href="#" style="color: #3b82f6; margin: 0 10px; text-decoration: none;">Contact Us</a>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;