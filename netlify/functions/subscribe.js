const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { email } = JSON.parse(event.body);

        if (!email || !email.includes('@')) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Valid email is required.' }),
            };
        }

        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        if (!RESEND_API_KEY) {
            console.error('RESEND_API_KEY is not set');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Server configuration error.' }),
            };
        }

        // 1. Add to Contact List (Audience)
        // Note: You need to have an Audience ID or use the default.
        // For this implementation, we'll focus on sending the welcome email 
        // and assume the user will manage the audience in Resend dashboard 
        // or we can use the 'contacts' endpoint if an audience exists.

        // 2. Send Welcome Email
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Quaniq <hello@resend.dev>', // Update to your verified domain later
                to: email,
                subject: 'Welcome to Quaniq — The Frontier Starts Here',
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0f; color: #f8fafc; padding: 40px; border-radius: 8px;">
            <img src="https://quaniq.netlify.app/images/quaniq-logo.svg" alt="Quaniq Logo" style="width: 48px; height: 48px; margin-bottom: 24px;">
            <h1 style="color: #6366f1; font-size: 24px; margin-bottom: 16px;">Welcome to the Frontier</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">
              Thank you for subscribing to Quaniq. You are now part of a community dedicated to the rigorous study of quantum computing and intelligent systems.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">
              We bridge the gap between theoretical quantum foundations and practical machine learning implementations. No hype, just physics.
            </p>
            <div style="margin: 32px 0;">
              <a href="https://quaniq.netlify.app/posts/001-what-is-quantum-ai" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Read our First Issue: What is Quantum AI?
              </a>
            </div>
            <hr style="border: 0; border-top: 1px solid #1e1e2e; margin: 32px 0;">
            <p style="font-size: 12px; color: #475569;">
              &copy; 2026 Quaniq. All rights reserved. <br>
              <a href="{{unsubscribe_url}}" style="color: #475569;">Unsubscribe</a>
            </p>
          </div>
        `,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Success' }),
            };
        } else {
            console.error('Resend Error:', data);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: data.message || 'Failed to subscribe.' }),
            };
        }
    } catch (error) {
        console.error('Server Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
