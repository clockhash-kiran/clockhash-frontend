import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
export async function GET(req: Request) {
    const url = new URL(req.url); // Parse the incoming URL
    const token = url.searchParams.get('token'); // Extract token from URL
  console.log("token:",token);
  if (!token) {
    return NextResponse.json({ message: 'Verification token is required.' }, { status: 400 });
  }

  try {
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken || new Date() > verificationToken.expires) {
      return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 400 });
    }

    // Proceed with updating email verification...
    await db.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Optionally, delete the token after it's used
    await db.verificationToken.delete({ where: { token } });

    return NextResponse.json({ message: 'Email verified successfully.' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
