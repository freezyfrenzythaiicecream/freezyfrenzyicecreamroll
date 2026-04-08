export type SiteConfig = {
  showHero: boolean;
  showMenu: boolean;
  showAbout: boolean;
  showWishingWall: boolean;
  showGallery: boolean;
  showContact: boolean;
  showHotBeveragePopup: boolean;
  announcement: string;
  imageOverrides: Record<string, string>;
};

export const SITE_SETTINGS_ID = 'main';

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  showHero: true,
  showMenu: true,
  showAbout: true,
  showWishingWall: true,
  showGallery: true,
  showContact: true,
  showHotBeveragePopup: true,
  announcement: '',
  imageOverrides: {},
};

export function mergeSiteConfig(partial: Partial<SiteConfig>): SiteConfig {
  return {
    ...DEFAULT_SITE_CONFIG,
    ...partial,
    imageOverrides: {
      ...DEFAULT_SITE_CONFIG.imageOverrides,
      ...(partial.imageOverrides ?? {}),
    },
  };
}
