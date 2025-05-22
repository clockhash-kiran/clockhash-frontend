// app/api/user/route.ts

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid"; // For generating verification tokens
import { sendVerificationEmail } from "@/lib/email"; // Send email function

// Define a schema for input validation
const userSchema = z.object({
    username: z.string().min(1, "Username is required").max(30),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z.string().min(8, "Password must have at least 8 characters"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, username, password } = userSchema.parse(body);

        // Check if email already exists
        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: "Email already in use" }, { status: 409 });
        }

        // Check if username already exists
        const existingUsername = await db.user.findUnique({ where: { username } });
        if (existingUsername) {
            return NextResponse.json({ message: "Username already exists" }, { status: 409 });
        }

        // Hash the password
        const hashedPassword = await hash(password, 10);

        // Create new user
        const newUser = await db.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                provider: "credentials",
                mfaEnabled: false, // Default MFA is disabled
                mfaCompleted: false,  // Mark this user as created via credentials
            },
        });

        // Generate a verification token
        const verificationToken = uuidv4();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Token expires in 1 hour

        // Save the verification token in the database
        await db.verificationToken.create({
            data: {
                token: verificationToken,
                identifier: email,
                expires: expiresAt,
            },
        });

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        // Exclude password from response
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...sanitizedUser } = newUser;


        return NextResponse.json({ user: sanitizedUser, message: "User created successfully. Please check your email to verify your account." }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return NextResponse.json({ message: "Duplicate field error" }, { status: 409 });
            }
        }
        return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
    }
}
