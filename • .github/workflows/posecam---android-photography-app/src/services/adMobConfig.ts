/**
 * Google Mobile Ads (AdMob) Configuration
 * 
 * Official Google Test Ad IDs are used here for development as requested.
 * Replace with your real production AdMob IDs before publishing to Google Play.
 */

export interface AdMobConfiguration {
  appId: string;
  bannerUnitId: string;
  interstitialUnitId: string;
  isTestMode: boolean;
}

export const ADMOB_CONFIG: AdMobConfiguration = {
  // Official AdMob Sample App ID (Google Test)
  appId: 'ca-app-pub-3940256099942544~3347511713',
  
  // Official Test Banner Ad Unit ID
  bannerUnitId: 'ca-app-pub-3940256099942544/6300978111',
  
  // Official Test Interstitial Ad Unit ID
  interstitialUnitId: 'ca-app-pub-3940256099942544/1033173712',
  
  isTestMode: true,
};

/**
 * Controller to manage when Interstitial Ads are shown.
 * Rule: Interstitial ads must ONLY be shown at natural transitions (such as after photo enhancement/save),
 * and NEVER when the app first launches.
 */
class AdMobManager {
  private lastInterstitialTime = 0;
  private minIntervalMs = 25000; // minimum cooldown between interstitials to respect user experience
  private actionsSinceLastAd = 0;

  public shouldShowInterstitial(): boolean {
    const now = Date.now();
    this.actionsSinceLastAd++;
    if (this.actionsSinceLastAd >= 1 && (now - this.lastInterstitialTime > this.minIntervalMs)) {
      return true;
    }
    return false;
  }

  public recordInterstitialShown(): void {
    this.lastInterstitialTime = Date.now();
    this.actionsSinceLastAd = 0;
  }
}

export const adMobManager = new AdMobManager();
