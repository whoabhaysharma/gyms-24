'use client';

import React from 'react';
import { LogIn } from './icons';

export const IconGoogle: React.FC<{ className?: string }> = ({ className }) => (
  // Use a Lucide login icon (styled by parent via className)
  <LogIn className={className} />
);

export default IconGoogle;
