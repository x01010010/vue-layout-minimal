// TypeScript interfaces for the AppFooter component

export interface FooterLink {
  id: string;
  title: string;
  href: string;
  icon?: string;
  external?: boolean;
}


export interface FooterProps {
  // Copyright configuration
  copyrightText?: string;
  showYear?: boolean;
  customYear?: number;
  
  // Application branding
  appName?: string;
  version?: string;
  showVersion?: boolean;
  
  // Navigation links
  navigationLinks?: FooterLink[];
  
  // Layout configuration
  centerContent?: string;
  showDividers?: boolean;
}

export interface FooterEmits {
  'link-click': [link: FooterLink];
}