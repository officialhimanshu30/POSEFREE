package com.posecam.app.ads

import android.app.Activity
import android.content.Context
import android.util.Log
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback

/**
 * AdMobManager
 * 
 * Centralized Google Mobile Ads manager using official Google test ad units.
 * 
 * CONFIGURATION:
 * Replace TEST IDs below with your real production AdMob IDs before publishing.
 */
object AdMobManager {

    private const val TAG = "AdMobManager"

    // =========================================================================
    // ADMOB AD UNIT IDs:
    // Using official Google Test Ad IDs as required during development.
    // =========================================================================
    const val BANNER_TEST_UNIT_ID = "ca-app-pub-3940256099942544/6300978111"
    const val INTERSTITIAL_TEST_UNIT_ID = "ca-app-pub-3940256099942544/1033173712"

    private var interstitialAd: InterstitialAd? = null
    private var isAdLoading = false

    fun initialize(context: Context) {
        MobileAds.initialize(context) { status ->
            Log.d(TAG, "AdMob MobileAds initialized: ${status.adapterStatusMap}")
        }
    }

    /**
     * Loads a standard 320x50 Banner Ad into the provided AdView.
     */
    fun loadBannerAd(adView: AdView) {
        val adRequest = AdRequest.Builder().build()
        adView.loadAd(adRequest)
    }

    /**
     * Preloads an Interstitial Ad in advance so it is immediately ready
     * to display at a natural transition (e.g. after photo enhancement or save).
     */
    fun preloadInterstitial(context: Context) {
        if (interstitialAd != null || isAdLoading) return

        isAdLoading = true
        val adRequest = AdRequest.Builder().build()

        InterstitialAd.load(
            context,
            INTERSTITIAL_TEST_UNIT_ID,
            adRequest,
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) {
                    interstitialAd = ad
                    isAdLoading = false
                    Log.d(TAG, "Interstitial Ad successfully loaded")
                }

                override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                    interstitialAd = null
                    isAdLoading = false
                    Log.w(TAG, "Interstitial failed to load: ${loadAdError.message}")
                }
            }
        )
    }

    /**
     * Shows the Interstitial Ad at an appropriate natural transition.
     * Rule: Never show immediately when the app opens.
     */
    fun showInterstitial(activity: Activity, onAdDismissed: (() -> Unit)? = null) {
        val ad = interstitialAd
        if (ad != null) {
            ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() {
                    interstitialAd = null
                    preloadInterstitial(activity) // Preload next ad
                    onAdDismissed?.invoke()
                }

                override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                    interstitialAd = null
                    onAdDismissed?.invoke()
                }
            }
            ad.show(activity)
        } else {
            preloadInterstitial(activity)
            onAdDismissed?.invoke()
        }
    }
}
