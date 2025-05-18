import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/mailer';


export async function POST(request: Request) {
  try {
    const { 
        "full-name": fullName,
        email, 
        phone, 
        message 
    } = await request.json();

    if (!fullName || !email || !message) {
      return NextResponse.json({ message: 'Full name, email, and message are required.' }, { status: 400 });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ message: 'Invalid email format.' }, { status: 400 });
    }

    const subject = `New Contact Form Submission from ${fullName}`;
    const emailBody = `
      <p>You have received a new message from your DishWish contact form:</p>
      <ul>
        <li><strong>Name:</strong> ${fullName}</li>
        <li><strong>Email:</strong> ${email}</li>
        ${phone ? `<li><strong>Phone:</strong> ${phone}</li>` : ''}
      </ul>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p>This email was sent from the DishWish contact form.</p>
    `;

    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM; // Define ADMIN_EMAIL in .env.local
    if (!adminEmail) {
        console.error("Admin email not configured for contact form submissions.");
        return NextResponse.json({ message: 'Server configuration error for contact form.' }, { status: 500 });
    }

    await sendMail({
      to: adminEmail,
      replyTo: email,
      subject: subject,
      html: emailBody,
    });

    await sendMail({
      to: email,
      subject: "We've Received Your Message - DishWish AI",
      html: `<p>Hi ${fullName},</p><p>Thank you for contacting DishWish AI! We've received your message and will get back to you as soon as possible.</p><p>Best regards,<br>The DishWish Team</p>`,
    });

    return NextResponse.json({ message: 'Message sent successfully! We will get back to you soon.' }, { status: 200 });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json({ message: 'Failed to send message. Please try again later.' }, { status: 500 });
  }
}