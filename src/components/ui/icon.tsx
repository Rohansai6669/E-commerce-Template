import * as LucideIcons from 'lucide-react';
import { type LucideProps } from 'lucide-react';

export type IconName = keyof Omit<
  typeof LucideIcons,
  'createReactComponent' | 'IconNode' | 'LucideProps'
>;

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
  className?: string;
}

/**
 * Polymorphic Icon wrapper encapsulating Lucide React.
 * Decouples icon dependencies from component interfaces.
 */
export function Icon({ name, className, ...props }: IconProps) {
  // Resolve icon dynamically from Lucide registry
  const IconComponent = LucideIcons[name] as React.ComponentType<{
    className?: string;
  } & Omit<LucideProps, 'ref'>>;

  if (!IconComponent) {
    console.warn(`Icon name "${name}" not found in lucide-react`);
    return null;
  }

  return <IconComponent className={className} {...props} />;
}
export default Icon;
