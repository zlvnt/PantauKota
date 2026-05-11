import {
  AlertTriangle,
  Lightbulb,
  Droplets,
  Building2,
  TreePine,
  MapPin,
  Trash2,
  Car,
  Zap,
  Wind,
  ShieldAlert,
  VolumeX,
  Flame,
  Waves,
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
  Car,
  Zap,
  Wind,
  ShieldAlert,
  VolumeX,
  Flame,
  Waves,
};

interface DynamicIconProps extends LucideProps {
  iconName?: string | null;
  defaultIcon?: string;
}

export function DynamicIcon({ iconName, defaultIcon = 'MapPin', ...props }: DynamicIconProps) {
  const IconComponent = iconMap[iconName ?? defaultIcon] || iconMap[defaultIcon] || MapPin;
  return <IconComponent {...props} />;
}
