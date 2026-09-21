import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source, created_at } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // TODO: Store in database
    // For now, just log the signup
    console.log('Waitlist signup:', {
      email,
      source: source || 'landing_page',
      created_at: created_at || new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // TODO: Connect to email service (e.g., ConvertKit, Mailchimp, etc.)
    // TODO: Send welcome email
    // TODO: Track conversion in analytics

    return NextResponse.json(
      { 
        success: true, 
        message: "Successfully joined the waitlist" 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
