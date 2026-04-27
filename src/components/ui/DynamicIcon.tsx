import {
  AlertTriangle,
  Lightbulb,
  Droplets,
  Building2,
  TreePine,
  MapPin,
  Trash2,
  LucideProps,
  LucideIcon
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  AlertTriangle,
  Trash2,
  Lightbulb,
  Droplets,
  Building2,
  TreePine,
  MapPin,
};

interface DynamicIconProps extends LucideProps {
  iconName?: string | null;
  defaultIcon?: string;
}

export function DynamicIcon({ iconName, defaultIcon = 'MapPin', ...props }: DynamicIconProps) {
  const IconComponent = iconMap[iconName ?? defaultIcon] || iconMap[defaultIcon] || MapPin;
  return <IconComponent {...props} />;
}
