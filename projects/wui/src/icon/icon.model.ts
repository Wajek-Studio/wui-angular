export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;

export interface IconDefinition {
  name: string;
  path: string;
}

// Map preset ukuran ke pixel value
export const ICON_SIZE_MAP: Record<string, string> = {
  xs: '12px',
  sm: '16px',
  md: '24px', // default
  lg: '32px',
  xl: '48px',
};