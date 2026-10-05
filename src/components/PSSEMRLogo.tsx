import React from 'react';

interface PSSEMRLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  height?: number | string;
}

export const PSSEMRLogo: React.FC<PSSEMRLogoProps> = ({
  className = '',
  size = 'md',
  height,
}) => {
  // Height presets based on prompt specifications:
  // Desktop header: 45–55px
  // Mobile header: 38–42px
  let heightClass = 'h-10 sm:h-[50px]'; // 40px mobile, 50px desktop
  if (size === 'sm') heightClass = 'h-8 sm:h-9';
  if (size === 'lg') heightClass = 'h-14 sm:h-16';
  if (size === 'xl') heightClass = 'h-20 sm:h-24';

  const style = height ? { height: typeof height === 'number' ? `${height}px` : height } : undefined;

  return (
    <img
      src="/pssemr_logo.png"
      alt="PSSEMR School & PU College Official Logo"
      className={`w-auto object-contain shrink-0 select-none ${heightClass} ${className}`}
      style={style}
      loading="eager"
      decoding="async"
    />
  );
};
