/**
 * Notification Service
 * Email and SMS notifications for critical events
 */

export interface NotificationConfig {
  email?: {
    provider: 'sendgrid' | 'resend';
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
  sms?: {
    provider: 'twilio';
    accountSid: string;
    authToken: string;
    fromNumber: string;
  };
}

export interface EmailNotification {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export interface SMSNotification {
  to: string;
  message: string;
}

export class NotificationService {
  private config: NotificationConfig;

  constructor(config: NotificationConfig) {
    this.config = config;
  }

  /**
   * Send email notification
   */
  async sendEmail(notification: EmailNotification): Promise<boolean> {
    if (!this.config.email) {
      console.warn('⚠️ Email not configured');
      return false;
    }

    try {
      const { provider, apiKey, fromEmail, fromName } = this.config.email;

      if (provider === 'sendgrid') {
        return await this.sendViaS endGrid(notification, apiKey, fromEmail, fromName);
      } else if (provider === 'resend') {
        return await this.sendViaResend(notification, apiKey, fromEmail, fromName);
      }

      return false;
    } catch (error: any) {
      console.error('❌ Email send failed:', error);
      return false;
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMS(notification: SMSNotification): Promise<boolean> {
    if (!this.config.sms) {
      console.warn('⚠️ SMS not configured');
      return false;
    }

    try {
      const { accountSid, authToken, fromNumber } = this.config.sms;
      return await this.sendViaTwilio(notification, accountSid, authToken, fromNumber);
    } catch (error: any) {
      console.error('❌ SMS send failed:', error);
      return false;
    }
  }

  /**
   * Send sensor alert notification
   */
  async sendSensorAlert(sensorId: string, value: number, threshold: number, zone: string): Promise<void> {
    const subject = `🚨 Sensor Alert: ${sensorId}`;
    const message = `Critical sensor alert in ${zone}!\n\nSensor: ${sensorId}\nCurrent Value: ${value}\nThreshold: ${threshold}\n\nPlease take immediate action.`;

    await this.sendEmail({
      to: 'admin@museum.com', // Should be from config
      subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">🚨 Critical Sensor Alert</h1>
          </div>
          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #1f2937; margin-bottom: 20px;">
              A sensor has exceeded its critical threshold in <strong>${zone}</strong>.
            </p>
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Sensor ID:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${sensorId}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Current Value:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #ef4444; font-weight: 600;">${value}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Threshold:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${threshold}</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: 600;">Zone:</td>
                <td style="padding: 12px;">${zone}</td>
              </tr>
            </table>
            <div style="margin-top: 20px; padding: 16px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
              <p style="margin: 0; color: #991b1b; font-weight: 600;">⚠️ Immediate Action Required</p>
              <p style="margin: 8px 0 0 0; color: #7f1d1d;">Please inspect the sensor and take corrective measures immediately.</p>
            </div>
          </div>
        </div>
      `
    });
  }

  /**
   * Send workflow completion notification
   */
  async sendWorkflowComplete(workflowId: string, workflowName: string, recipientEmail: string): Promise<void> {
    await this.sendEmail({
      to: recipientEmail,
      subject: `✅ Workflow Complete: ${workflowName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">✅ Workflow Completed</h1>
          </div>
          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #1f2937;">
              Your workflow <strong>${workflowName}</strong> has been successfully completed.
            </p>
            <p style="color: #6b7280;">Workflow ID: ${workflowId}</p>
            <a href="https://your-museum.com/workflows/${workflowId}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">View Workflow</a>
          </div>
        </div>
      `
    });
  }

  /**
   * SendGrid integration
   */
  private async sendViaSendGrid(notification: EmailNotification, apiKey: string, fromEmail: string, fromName: string): Promise<boolean> {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: Array.isArray(notification.to)
            ? notification.to.map(email => ({ email }))
            : [{ email: notification.to }],
          subject: notification.subject,
        }],
        from: {
          email: fromEmail,
          name: fromName,
        },
        content: [
          { type: 'text/plain', value: notification.text || '' },
          { type: 'text/html', value: notification.html },
        ],
      }),
    });

    return response.ok;
  }

  /**
   * Resend integration
   */
  private async sendViaResend(notification: EmailNotification, apiKey: string, fromEmail: string, fromName: string): Promise<boolean> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: Array.isArray(notification.to) ? notification.to : [notification.to],
        subject: notification.subject,
        html: notification.html,
        text: notification.text,
      }),
    });

    return response.ok;
  }

  /**
   * Twilio integration
   */
  private async sendViaTwilio(notification: SMSNotification, accountSid: string, authToken: string, fromNumber: string): Promise<boolean> {
    const auth = btoa(`${accountSid}:${authToken}`);
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: notification.to,
          Body: notification.message,
        }),
      }
    );

    return response.ok;
  }
}

export default NotificationService;
