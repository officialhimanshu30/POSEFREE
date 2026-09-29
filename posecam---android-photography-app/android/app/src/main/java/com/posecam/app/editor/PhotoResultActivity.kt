package com.posecam.app.editor

import android.content.Intent
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import com.posecam.app.ads.AdMobManager
import com.posecam.app.databinding.ActivityPhotoResultBinding
import com.posecam.app.storage.LocalStorageManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File

/**
 * PhotoResultActivity
 * 
 * Displays the captured photo and provides action options:
 * - Retake
 * - Enhance Background (subject-aware lighting/color/depth)
 * - Save to device MediaStore
 * - Share via Android system share sheet
 * 
 * Shows AdMob interstitial ad at natural transition after saving/enhancing.
 */
class PhotoResultActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_PHOTO_PATH = "extra_photo_path"
    }

    private lateinit var binding: ActivityPhotoResultBinding
    private var photoFile: File? = null
    private var savedUri: Uri? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPhotoResultBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Preload AdMob interstitial so it's ready for natural transition
        AdMobManager.preloadInterstitial(this)

        val photoPath = intent.getStringExtra(EXTRA_PHOTO_PATH)
        if (photoPath != null) {
            photoFile = File(photoPath)
            Glide.with(this).load(photoFile).into(binding.imgCaptured)
        }

        setupButtons()
    }

    private fun setupButtons() {
        // Retake Button -> returns to camera
        binding.btnRetake.setOnClickListener {
            finish()
        }

        // Enhance Background Button
        binding.btnEnhance.setOnClickListener {
            enhanceBackground()
        }

        // Save Photo to local device storage using modern MediaStore
        binding.btnSave.setOnClickListener {
            savePhotoToGallery()
        }

        // Share Photo
        binding.btnShare.setOnClickListener {
            sharePhoto()
        }
    }

    private fun enhanceBackground() {
        val file = photoFile ?: return
        binding.progressBar.visibility = View.VISIBLE
        binding.btnEnhance.isEnabled = false

        lifecycleScope.launch(Dispatchers.IO) {
            val bitmap = BitmapFactory.decodeFile(file.absolutePath)
            // Call extensible BackgroundEnhancementService
            val enhancedBitmap = BackgroundEnhancementService.enhanceBackground(bitmap)

            // Save enhanced bitmap back to cache file
            enhancedBitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 95, file.outputStream())

            withContext(Dispatchers.Main) {
                binding.progressBar.visibility = View.GONE
                binding.btnEnhance.isEnabled = true
                Glide.with(this@PhotoResultActivity).load(file).into(binding.imgCaptured)
                Toast.makeText(this@PhotoResultActivity, "Background enhanced!", Toast.LENGTH_SHORT).show()

                // Trigger AdMob interstitial at natural transition after editing
                AdMobManager.showInterstitial(this@PhotoResultActivity)
            }
        }
    }

    private fun savePhotoToGallery() {
        val file = photoFile ?: return
        lifecycleScope.launch(Dispatchers.IO) {
            val uri = LocalStorageManager.saveImageToMediaStore(this@PhotoResultActivity, file)
            savedUri = uri

            withContext(Dispatchers.Main) {
                if (uri != null) {
                    Toast.makeText(this@PhotoResultActivity, "Photo saved to Gallery!", Toast.LENGTH_SHORT).show()
                    // Natural transition interstitial
                    AdMobManager.showInterstitial(this@PhotoResultActivity)
                } else {
                    Toast.makeText(this@PhotoResultActivity, "Failed to save photo", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun sharePhoto() {
        val file = photoFile ?: return
        val uri = FileProvider.getUriForFile(
            this,
            "\${applicationContext.packageName}.provider",
            file
        )

        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "image/jpeg"
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        startActivity(Intent.createChooser(shareIntent, "Share Photo via"))
    }
}
