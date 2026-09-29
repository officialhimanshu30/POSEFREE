package com.posecam.app.pose

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.DashPathEffect
import android.graphics.Paint
import android.graphics.Path
import android.util.AttributeSet
import android.view.View

/**
 * PoseOverlayView
 * 
 * Custom View overlaid above CameraX PreviewView.
 * Renders semi-transparent vector guide lines with adjustable alpha.
 * 
 * CRITICAL: This view is purely a UI visual guide and does not touch
 * or alter the raw captured photo data.
 */
class PoseOverlayView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private var activePose: PoseTemplate? = null

    private val linePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
        style = Paint.Style.STROKE
        strokeWidth = 6f
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }

    private val guideLinePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#80FFFFFF")
        style = Paint.Style.STROKE
        strokeWidth = 2.5f
        pathEffect = DashPathEffect(floatArrayOf(10f, 10f), 0f)
    }

    fun setPose(pose: PoseTemplate) {
        this.activePose = pose
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        if (activePose == null) return

        val w = width.toFloat()
        val h = height.toFloat()
        if (w <= 0 || h <= 0) return

        drawSilhouette(canvas, w, h)
    }

    private fun drawSilhouette(canvas: Canvas, w: Float, h: Float) {
        val cx = w * 0.5f

        // Head Guide
        val headRadius = w * 0.12f
        val headCenterY = h * 0.22f
        canvas.drawCircle(cx, headCenterY, headRadius, linePaint)

        // Eye Level alignment guideline
        canvas.drawLine(cx - headRadius * 0.8f, headCenterY, cx + headRadius * 0.8f, headCenterY, guideLinePaint)

        // Torso / Shoulder alignment
        val shoulderY = headCenterY + headRadius + 30f
        val shoulderWidth = w * 0.32f
        canvas.drawLine(cx - shoulderWidth, shoulderY, cx + shoulderWidth, shoulderY, linePaint)

        // Torso Box
        val torsoPath = Path().apply {
            moveTo(cx - shoulderWidth * 0.9f, shoulderY)
            lineTo(cx - shoulderWidth * 0.7f, h * 0.55f)
            lineTo(cx + shoulderWidth * 0.7f, h * 0.55f)
            lineTo(cx + shoulderWidth * 0.9f, shoulderY)
            close()
        }
        canvas.drawPath(torsoPath, linePaint)

        // Center spine guideline
        canvas.drawLine(cx, h * 0.10f, cx, h * 0.85f, guideLinePaint)

        // Lower body / Leg guide lines
        val hipY = h * 0.55f
        canvas.drawLine(cx - shoulderWidth * 0.5f, hipY, cx - shoulderWidth * 0.4f, h * 0.88f, linePaint)
        canvas.drawLine(cx + shoulderWidth * 0.5f, hipY, cx + shoulderWidth * 0.4f, h * 0.88f, linePaint)
    }
}
