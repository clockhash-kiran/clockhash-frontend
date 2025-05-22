// Create this file as /app/api/security/scan/[tool]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    // Get the tool from the URL params
    const { tool } = params;
    
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get request body
    const requestData = await request.json();
    
    // Make sure user_id matches the authenticated user
    requestData.user_id = session.user.id;
    
    console.log(`Proxying scan request to backend for tool: ${tool}`);
    
    // Forward the request to the backend
    const backendResponse = await fetch(`http://localhost:8000/scan/${tool}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`Backend error: ${backendResponse.status} - ${errorText}`);
      return NextResponse.json(
        { message: `Backend error: ${backendResponse.status}` }, 
        { status: backendResponse.status }
      );
    }
    
    // Get the response from the backend
    const responseData = await backendResponse.json();
    
    // Return the response to the client
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error in security scan API route:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}