import {
  getRegistrationInvitation,
  registerInvitationAccount
} from '../services/invitationService.js';
import { activatePricingInvitationRegistration } from '../services/subscriptionSyncService.js';
import { sendEmail } from '../utils/mailer.js';
import { validateRegistrationPayload } from '../utils/invitationValidation.js';

const getLoginUrl = () =>
  process.env.ERP_LOGIN_URL ||
  process.env.ERP_FRONTEND_URL ||
  process.env.CLIENT_URL ||
  'http://localhost:5173';

const sendInvitationWelcomeEmail = async ({ registration }) => {
  if (registration.idempotent || !registration.user?.email) return null;

  const loginUrl = getLoginUrl();

  const emailResult = await sendEmail({
    to: registration.user.email,
    subject: 'Welcome to Vconstech ERP - Your account is ready',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px;margin:auto">
        <h2 style="margin-bottom:12px">Welcome to Vconstech ERP</h2>
        <p>Hi <strong>${registration.user.name || 'Customer'}</strong>,</p>
        <p>Your ERP account has been created successfully from your registration invitation.</p>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:20px 0">
          <p style="margin:0 0 8px"><strong>Login Link:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
          <p style="margin:0"><strong>Registered Email:</strong> ${registration.user.email}</p>
        </div>
        <p>Please use the password you created during registration to log in.</p>
        <p>Best Regards,<br/><strong>Vconstech ERP</strong></p>
      </div>
    `
  });

  return {
    sent: emailResult.success,
    to: registration.user.email,
    subject: 'Welcome to Vconstech ERP - Your account is ready',
    loginUrl,
    ...(emailResult.success ? {} : { error: emailResult.error, code: emailResult.code })
  };
};

export const validateInvitation = async (req, res) => {
  try {
    const invitation = await getRegistrationInvitation(req.params.invitationId);

    console.log('[ERP Registration] Invitation validated', {
      invitationId: req.params.invitationId,
      crmLeadId: invitation.crmLeadId,
      crmCustomerId: invitation.crmCustomerId
    });

    res.json({
      success: true,
      invitation
    });
  } catch (error) {
    console.error('[ERP Registration] Invitation validation failed', {
      invitationId: req.params.invitationId,
      message: error.message
    });

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
      details: error.details
    });
  }
};

export const registerInvitation = async (req, res) => {
  const { values, errors } = validateRegistrationPayload(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid registration payload',
      errors
    });
  }

  try {
    const registration = await registerInvitationAccount({
      invitationId: req.params.invitationId,
      input: values
    });

    const paidSubscription = await activatePricingInvitationRegistration({
      registration
    });
    const welcomeEmail = await sendInvitationWelcomeEmail({
      registration
    });

    console.log('[ERP Registration] Account registered', {
      invitationId: registration.invitationId,
      userId: registration.user.id,
      clientId: registration.clientId,
      welcomeEmailSent: welcomeEmail?.sent === true,
      welcomeEmailError: welcomeEmail?.sent === false ? welcomeEmail.error : undefined
    });

    res.status(registration.idempotent ? 200 : 201).json({
      success: true,
      message: 'ERP account registered successfully',
      registration,
      ...(welcomeEmail ? { welcomeEmail } : {}),
      ...(paidSubscription ? { paidSubscription } : {})
    });
  } catch (error) {
    console.error('[ERP Registration] Registration failed', {
      invitationId: req.params.invitationId,
      message: error.message,
      details: error.details
    });

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
      details: error.details
    });
  }
};
