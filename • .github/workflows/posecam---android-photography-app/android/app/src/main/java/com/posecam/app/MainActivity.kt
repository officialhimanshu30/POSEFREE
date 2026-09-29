package com.posecam.app

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.google.android.gms.ads.AdView
import com.posecam.app.ads.AdMobManager
import com.posecam.app.camera.CameraActivity
import com.posecam.app.databinding.ActivityMainBinding
import com.posecam.app.gallery.PoseGalleryActivity

/**
 * PoseCam Home Screen
 * 
 * Clean, modern photography app entry point.
 * Houses primary actions: Take Photo, Pose Gallery, My Photos,
 * and hosts the persistent bottom AdMob banner test ad.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var adView: AdView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // 1. Initialize AdMob Mobile Ads SDK
        AdMobManager.initialize(this)

        // 2. Setup AdMob Banner Test Ad at bottom of screen
        setupAdMobBanner()

        // 3. Setup UI Click Listeners
        binding.btnTakePhoto.setOnClickListener {
            // Open camera directly with default/popular pose
            val intent = Intent(this, CameraActivity::class.java).apply {
                putExtra(CameraActivity.EXTRA_POSE_ID, "stand-1")
            }
            startActivity(intent)
        }

        binding.btnPoseGallery.setOnClickListener {
            // Open Pose Gallery to choose a pose
            val intent = Intent(this, PoseGalleryActivity::class.java)
            startActivity(intent)
        }

        binding.btnMyPhotos.setOnClickListener {
            // Launch device gallery / internal captured photos
            val intent = Intent(Intent.ACTION_VIEW).apply {
                type = "image/*"
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            try {
                startActivity(intent)
            } catch (e: Exception) {
                // Fallback handled gracefully
            }
        }
    }

    private fun setupAdMobBanner() {
        adView = binding.adViewBanner
        AdMobManager.loadBannerAd(adView)
    }

    override fun onResume() {
        super.onResume()
        adView.resume()
    }

    override fun onPause() {
        adView.pause()
        super.onPause()
    }

    override fun onDestroy() {
        adView.destroy()
        super.onDestroy()
    }
}
