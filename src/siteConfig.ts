export type SiteConfig = {
  showHero: boolean;
  showMenu: boolean;
  showAbout: boolean;
  showWishingWall: boolean;
  showGallery: boolean;
  showContact: boolean;
  showHotBeveragePopup: boolean;
  /** Shown in a strip below the site header when non-empty */
  announcement: string;
  /**
   * Map built-in image URLs (e.g. /images/rolls/berryblast.png) to uploaded URLs
   * served from /api/site-assets/… when the site is backed by the API.
   */
  imageOverrides: Record<string, string>;
};

export const SITE_CONFIG_STORAGE_KEY = 'freezy-frenzy-site-config';

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
