package com.posefree.app.gallery

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.posefree.app.databinding.ItemPoseCardBinding
import com.posefree.app.pose.PoseTemplate

class PoseAdapter(
    private val onPoseSelected: (PoseTemplate) -> Unit
) : RecyclerView.Adapter<PoseAdapter.PoseViewHolder>() {

    private var items: List<PoseTemplate> = emptyList()

    fun submitList(newItems: List<PoseTemplate>) {
        items = newItems
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PoseViewHolder {
        val binding = ItemPoseCardBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return PoseViewHolder(binding)
    }

    override fun onBindViewHolder(holder: PoseViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class PoseViewHolder(private val binding: ItemPoseCardBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(pose: PoseTemplate) {
            binding.tvPoseName.text = pose.name
            binding.tvPoseCategory.text = pose.category.displayName
            binding.tvPoseTip.text = pose.tip
            binding.poseOverlayThumbnail.setPose(pose)

            binding.btnSelectPose.setOnClickListener {
                onPoseSelected(pose)
            }
            binding.root.setOnClickListener {
                onPoseSelected(pose)
            }
        }
    }
}
