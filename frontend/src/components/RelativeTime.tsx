'use client';

import React, { useState, useEffect } from 'react';
import { formatRelativeTime } from '@/lib/utils';

export function RelativeTime({
  dateString,
  className,
}: {
  dateString: string;
  className?: string;
}) {
  const [formatted, setFormatted] = useState<string>(() => formatRelativeTime(dateString));

  useEffect(() => {
    // Re-evaluate client relative time after mount
    setFormatted(formatRelativeTime(dateString, true));
  }, [dateString]);

  return (
    <span suppressHydrationWarning className={className}>
      {formatted}
    </span>
  );
}

export default RelativeTime;
