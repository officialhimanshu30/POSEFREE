package com.posecam.app.gallery

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import com.google.android.material.tabs.TabLayout
import com.posecam.app.camera.CameraActivity
import com.posecam.app.databinding.ActivityPoseGalleryBinding
import com.posecam.app.pose.PoseCatalog
import com.posecam.app.pose.PoseCategory

/**
 * PoseGalleryActivity
 * 
 * Displays gallery of pose templates categorized by:
 * Standing, Sitting, Selfie, Walking.
 * Each pose card includes preview, title, tip, and "Use Pose" action.
 */
class PoseGalleryActivity : AppCompatActivity() {

    private lateinit var binding: ActivityPoseGalleryBinding
    private lateinit var poseAdapter: PoseAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPoseGalleryBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupRecyclerView()
        setupCategoryTabs()

        binding.btnBack.setOnClickListener {
            finish()
        }
    }

    private fun setupRecyclerView() {
        poseAdapter = PoseAdapter { selectedPose ->
            val intent = Intent(this, CameraActivity::class.java).apply {
                putExtra(CameraActivity.EXTRA_POSE_ID, selectedPose.id)
            }
            startActivity(intent)
            finish()
        }

        binding.recyclerPoses.apply {
            layoutManager = GridLayoutManager(this@PoseGalleryActivity, 2)
            adapter = poseAdapter
        }

        poseAdapter.submitList(PoseCatalog.getAllPoses())
    }

    private fun setupCategoryTabs() {
        binding.tabLayoutCategories.addTab(binding.tabLayoutCategories.newTab().setText("All"))
        PoseCategory.values().forEach { category ->
            binding.tabLayoutCategories.addTab(
                binding.tabLayoutCategories.newTab().setText(category.displayName)
            )
        }

        binding.tabLayoutCategories.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab?) {
                val position = tab?.position ?: 0
                if (position == 0) {
                    poseAdapter.submitList(PoseCatalog.getAllPoses())
                } else {
                    val category = PoseCategory.values()[position - 1]
                    poseAdapter.submitList(PoseCatalog.getPosesByCategory(category))
                }
            }
            override fun onTabUnselected(tab: TabLayout.Tab?) {}
            override fun onTabReselected(tab: TabLayout.Tab?) {}
        })
    }
}
