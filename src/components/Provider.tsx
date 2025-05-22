'use client'

import { SessionProvider } from "next-auth/react";
import {FC, ReactNode } from 'react';
interface ProvideProps{
    children: ReactNode;
}
const Provider: FC<ProvideProps> = ({ children }) => {
  return (
    <SessionProvider>{children}</SessionProvider>
  )
}

export default Provider