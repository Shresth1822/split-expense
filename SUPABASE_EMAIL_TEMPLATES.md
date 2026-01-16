# Supabase Email Templates

To make your emails look professional, you need to update the HTML templates in the Supabase Dashboard.

**Go to:** Supabase Dashboard -> Authentication -> Email Templates

---

## 1. Reset Password

_Subject:_ Reset your Splitify password

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Password</title>
  </head>
  <body
    style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0;"
  >
    <table
      role="presentation"
      width="100%"
      border="0"
      cellspacing="0"
      cellpadding="0"
      style="background-color: #f4f4f5; padding: 40px 0;"
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            width="600"
            border="0"
            cellspacing="0"
            cellpadding="0"
            style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;"
          >
            <!-- Header -->
            <tr>
              <td
                style="background-color: #09090b; padding: 24px; text-align: center;"
              >
                <h1
                  style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;"
                >
                  Splitify.
                </h1>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 40px 32px;">
                <h2
                  style="color: #18181b; margin: 0 0 16px; font-size: 20px; font-weight: 600;"
                >
                  Reset your password
                </h2>
                <p
                  style="color: #52525b; margin: 0 0 24px; font-size: 16px; line-height: 1.6;"
                >
                  Hello,
                </p>
                <p
                  style="color: #52525b; margin: 0 0 32px; font-size: 16px; line-height: 1.6;"
                >
                  We received a request to reset your password for your Splitify
                  account. If you didn't make this request, you can safely
                  ignore this email.
                </p>

                <table
                  role="presentation"
                  border="0"
                  cellspacing="0"
                  cellpadding="0"
                >
                  <tr>
                    <td align="center">
                      <a
                        href="{{ .ConfirmationURL }}"
                        style="display: inline-block; background-color: #09090b; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 16px;"
                        >Reset Password</a
                      >
                    </td>
                  </tr>
                </table>

                <p
                  style="color: #71717a; margin: 32px 0 0; font-size: 14px; line-height: 1.6;"
                >
                  Or copy and paste this link into your browser:<br />
                  <a
                    href="{{ .ConfirmationURL }}"
                    style="color: #2563eb; text-decoration: underline; word-break: break-all;"
                    >{{ .ConfirmationURL }}</a
                  >
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td
                style="background-color: #fafafa; padding: 24px; text-align: center; border-top: 1px solid #e4e4e7;"
              >
                <p style="color: #a1a1aa; margin: 0; font-size: 12px;">
                  &copy; 2025 Splitify. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## 2. Confirm Signup (Verification)

_Subject:_ Welcome to Splitify! Please confirm your email

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Confirm Your Email</title>
  </head>
  <body
    style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0;"
  >
    <table
      role="presentation"
      width="100%"
      border="0"
      cellspacing="0"
      cellpadding="0"
      style="background-color: #f4f4f5; padding: 40px 0;"
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            width="600"
            border="0"
            cellspacing="0"
            cellpadding="0"
            style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;"
          >
            <!-- Header -->
            <tr>
              <td
                style="background-color: #09090b; padding: 24px; text-align: center;"
              >
                <h1
                  style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;"
                >
                  Splitify.
                </h1>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 40px 32px;">
                <h2
                  style="color: #18181b; margin: 0 0 16px; font-size: 20px; font-weight: 600;"
                >
                  Welcome to Splitify!
                </h2>
                <p
                  style="color: #52525b; margin: 0 0 24px; font-size: 16px; line-height: 1.6;"
                >
                  Thanks for signing up. We're excited to help you manage your
                  shared expenses easily. To get started, please confirm your
                  email address.
                </p>

                <table
                  role="presentation"
                  border="0"
                  cellspacing="0"
                  cellpadding="0"
                >
                  <tr>
                    <td align="center">
                      <a
                        href="{{ .ConfirmationURL }}"
                        style="display: inline-block; background-color: #09090b; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 16px;"
                        >Confirm Email</a
                      >
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td
                style="background-color: #fafafa; padding: 24px; text-align: center; border-top: 1px solid #e4e4e7;"
              >
                <p style="color: #a1a1aa; margin: 0; font-size: 12px;">
                  &copy; 2025 Splitify. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

## 3. Invite User (Optional)

_Subject:_ You've been invited to join Splitify

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invitation</title>
  </head>
  <body
    style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0;"
  >
    <table
      role="presentation"
      width="100%"
      border="0"
      cellspacing="0"
      cellpadding="0"
      style="background-color: #f4f4f5; padding: 40px 0;"
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            width="600"
            border="0"
            cellspacing="0"
            cellpadding="0"
            style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;"
          >
            <!-- Header -->
            <tr>
              <td
                style="background-color: #09090b; padding: 24px; text-align: center;"
              >
                <h1
                  style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;"
                >
                  Splitify.
                </h1>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 40px 32px;">
                <h2
                  style="color: #18181b; margin: 0 0 16px; font-size: 20px; font-weight: 600;"
                >
                  You've been invited!
                </h2>
                <p
                  style="color: #52525b; margin: 0 0 24px; font-size: 16px; line-height: 1.6;"
                >
                  Someone has invited you to join them on Splitify. Click the
                  button below to accept the invitation and start tracking
                  expenses together.
                </p>

                <table
                  role="presentation"
                  border="0"
                  cellspacing="0"
                  cellpadding="0"
                >
                  <tr>
                    <td align="center">
                      <a
                        href="{{ .ConfirmationURL }}"
                        style="display: inline-block; background-color: #09090b; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 16px;"
                        >Accept Invitation</a
                      >
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td
                style="background-color: #fafafa; padding: 24px; text-align: center; border-top: 1px solid #e4e4e7;"
              >
                <p style="color: #a1a1aa; margin: 0; font-size: 12px;">
                  &copy; 2025 Splitify. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```
