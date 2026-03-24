# accounts/email_utils.py
from django.utils import timezone
from django.conf import settings

def generate_email_content(email_type, user_name, otp=None, app_name="E-Learning Platform"):
    """
    Generate subject and HTML content for different email types.
    """
    name = user_name
    subject = ""
    content = ""

    if email_type == "verify":
        subject = "Verify your email"
        content = f"""
        <h2>Hello {name},</h2>
        <p>Thanks for registering on {app_name}. Please verify your email using the OTP below:</p>
        <h3 style="color: #2E86C1;">{otp}</h3>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not register, please ignore this email.</p>
        """

    elif email_type == "welcome":
        subject = f"Welcome to {app_name}!"
        content = f"""
        <h2>Welcome {name}!</h2>
        <p>Thanks for joining {app_name}. We're excited to have you on board.</p>
        <p>Feel free to explore our features and start learning!</p>
        """

    elif email_type == "reset":
        subject = "Reset your password"
        content = f"""
        <h2>Hello {name},</h2>
        <p>We received a request to reset your password. Use the OTP below to reset it:</p>
        <h3 style="color: #E74C3C;">{otp}</h3>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        """

    elif email_type == "update":
        subject = "Your password has been updated"
        content = f"""
        <h2>Hello {name},</h2>
        <p>This is to confirm that your password on {app_name} has been successfully updated.</p>
        <p>If you did not perform this action, please reset your password immediately.</p>
        """

    elif email_type == "resend":
        subject = "Resend Confirmation Code"
        content = f"""
        <h2>Hello {name},</h2>
        <p>You requested a new confirmation code for <strong>{app_name}</strong>.</p>
        <p>Your confirmation code is:</p>
        <h3 style="color:#2E86C1;">{otp}</h3>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p>If you did not request this code, you can safely ignore this email.</p>
        """

    elif email_type == "resend-reset":
        subject = "Resend Password Reset Code"
        content = f"""
        <h2>Hello {name},</h2>
        <p>You requested a new password reset code for your <strong>{app_name}</strong> account.</p>
        <p>Use the OTP below to reset your password:</p>
        <h3 style="color:#E74C3C;">{otp}</h3>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p>If you did not request this, please secure your account immediately.</p>
        """

    else:
        raise ValueError("Invalid email type")

    return {"subject": subject, "content": content}


def signed_in_email(name, ip, user_agent, region="Somewhere", country_name="Unknown"):
    """Generate sign-in alert email."""
    subject = "New sign-in detected"
    content = f"""
    <h2>Hello {name},</h2>
    <p>We noticed a new sign-in to your account from another device.</p>
    <p>If this was you, no action is needed. Otherwise, please reset your password immediately.</p>
    <p>Time of sign-in: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    <p>IP address: {ip}</p>
    <p>User agent: {user_agent}</p>
    <p>Location: {region}, {country_name}</p>
    """
    return {"subject": subject, "content": content}