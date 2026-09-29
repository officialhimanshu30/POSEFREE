package com.posecam.app.camera

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.os.CountDownTimer
import android.view.View
import android.widget.SeekBar
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.posecam.app.databinding.ActivityCameraBinding
import com.posecam.app.editor.PhotoResultActivity
import com.posecam.app.pose.PoseCatalog
import java.io.File

/**
 * CameraActivity
 * 
 * Provides the interactive shooting screen:
 * - Live camera stream (front/rear flip)
 * - Semi-transparent pose overlay drawn over the preview
 * - Opacity adjustment slider
 * - Hide/Show overlay toggle
 * - 3s and 5s self-timer
 * - Shutter capture trigger
 */
class CameraActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_POSE_ID = "extra_pose_id"
    }

    private lateinit var binding: ActivityCameraBinding
    private lateinit var cameraManager: CameraManager

    private var activeTimerDurationSeconds: Int = 0
    private var isCountingDown: Boolean = false

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            setupCamera()
        } else {
            Toast.makeText(this, "Camera permission is required to take photos", Toast.LENGTH_LONG).show()
            finish()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCameraBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val poseId = intent.getStringExtra(EXTRA_POSE_ID) ?: "stand-1"
        setupPoseOverlay(poseId)

        if (allPermissionsGranted()) {
            setupCamera()
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA)
        }

        setupControls()
    }

    private fun setupPoseOverlay(poseId: String) {
        val pose = PoseCatalog.getPoseById(poseId) ?: PoseCatalog.getAllPoses().first()
        binding.tvPoseName.text = pose.name
        binding.tvPoseTip.text = pose.tip
        binding.poseOverlayView.setPose(pose)
    }

    private fun setupCamera() {
        cameraManager = CameraManager(this, this)
        cameraManager.startCamera(binding.viewFinder) { error ->
            Toast.makeText(this, "Failed to start camera: \${error.localizedMessage}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupControls() {
        // Shutter Button
        binding.btnCapture.setOnClickListener {
            if (isCountingDown) return@setOnClickListener

            if (activeTimerDurationSeconds > 0) {
                startCountdown(activeTimerDurationSeconds)
            } else {
                executeCapture()
            }
        }

        // Camera Flip (Front / Back)
        binding.btnFlipCamera.setOnClickListener {
            cameraManager.switchCamera(binding.viewFinder)
        }

        // Overlay Opacity Slider
        binding.seekbarOpacity.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                val alpha = progress / 100f
                binding.poseOverlayView.alpha = alpha
            }
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })

        // Hide / Show Overlay Toggle
        binding.btnToggleOverlay.setOnClickListener {
            val isVisible = binding.poseOverlayView.visibility == View.VISIBLE
            binding.poseOverlayView.visibility = if (isVisible) View.INVISIBLE else View.VISIBLE
            binding.btnToggleOverlay.isSelected = !isVisible
        }

        // Timer Options Toggle (Off -> 3s -> 5s -> Off)
        binding.btnTimer.setOnClickListener {
            when (activeTimerDurationSeconds) {
                0 -> {
                    activeTimerDurationSeconds = 3
                    binding.btnTimer.text = "3s"
                }
                3 -> {
                    activeTimerDurationSeconds = 5
                    binding.btnTimer.text = "5s"
                }
                else -> {
                    activeTimerDurationSeconds = 0
                    binding.btnTimer.text = "Off"
                }
            }
        }

        binding.btnClose.setOnClickListener {
            finish()
        }
    }

    private fun startCountdown(seconds: Int) {
        isCountingDown = true
        binding.tvCountdown.visibility = View.VISIBLE

        object : CountDownTimer((seconds * 1000).toLong(), 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val secRemaining = (millisUntilFinished / 1000 + 1).toInt()
                binding.tvCountdown.text = secRemaining.toString()
            }

            override fun onFinish() {
                binding.tvCountdown.visibility = View.GONE
                isCountingDown = false
                executeCapture()
            }
        }.start()
    }

    private fun executeCapture() {
        binding.viewShutterFlash.visibility = View.VISIBLE
        binding.viewShutterFlash.postDelayed({
            binding.viewShutterFlash.visibility = View.GONE
        }, 80)

        val outputDir = externalCacheDir ?: cacheDir
        cameraManager.takePhoto(
            outputDirectory = outputDir,
            onPhotoCaptured = { photoFile ->
                runOnUiThread {
                    val intent = Intent(this, PhotoResultActivity::class.java).apply {
                        putExtra(PhotoResultActivity.EXTRA_PHOTO_PATH, photoFile.absolutePath)
                    }
                    startActivity(intent)
                }
            },
            onError = { exc ->
                runOnUiThread {
                    Toast.makeText(this, "Capture failed: \${exc.message}", Toast.LENGTH_SHORT).show()
                }
            }
        )
    }

    private fun allPermissionsGranted() = ContextCompat.checkSelfPermission(
        baseContext, Manifest.permission.CAMERA
    ) == PackageManager.PERMISSION_GRANTED

    override fun onDestroy() {
        super.onDestroy()
        if (::cameraManager.isInitialized) {
            cameraManager.shutdown()
        }
    }
}
