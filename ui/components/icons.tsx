'use client';

import React from 'react';
import * as Lucide from 'lucide-react';

// Generic Icon component: pass a Lucide icon name as `name`
export type LucideIconName = keyof typeof Lucide;

export const Icon: React.FC<{ name: LucideIconName; className?: string } & React.SVGProps<SVGSVGElement>> = ({
  name,
  className,
  ...props
}) => {
  // Access the icon component dynamically from the Lucide namespace
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = (Lucide as any)[name];
  if (!Comp) return null;
  return <Comp className={className} {...props} />;
};

// Re-export some commonly used icons for convenience
export { LogIn, User, Calendar, MapPin, CreditCard, Server } from 'lucide-react';

export default Icon;
    