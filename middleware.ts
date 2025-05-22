import { withAuth } from "next-auth/middleware";

// Protect routes that require authentication
export default withAuth({
  pages: {
    signIn: "/sign-in",
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"], // Only protect these routes
};
