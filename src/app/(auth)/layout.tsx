import React, { FC, ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="p-10 w-[90%] max-w-md rounded-md">{children}</div>
    </div>
  );
};

export default AuthLayout;
