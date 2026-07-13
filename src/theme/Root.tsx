import type {ReactNode} from 'react';
import PixelToggle from '@site/src/components/PixelToggle';

// Docusaurus wraps the whole app in <Root>. We use it only to mount the global
// pixel/CLI theme toggle — no navbar swizzle, no change to existing layout.
export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <>
      {children}
      <PixelToggle />
    </>
  );
}
