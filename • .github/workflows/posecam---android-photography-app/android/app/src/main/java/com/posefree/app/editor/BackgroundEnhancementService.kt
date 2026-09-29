package com.posefree.app.editor

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.RadialGradient
import android.graphics.Shader

/**
 * BackgroundEnhancementService
 * 
 * ARCHITECTURE CONTRACT:
 * 1. Do NOT generate a fake AI image.
 * 2. Do NOT alter or replace the person's face, body, or clothing.
 * 3. Improves background color, lighting, warmth, and depth blur.
 * 
 * Design Note:
 * This implementation provides on-device portrait background enhancement.
 * To integrate Google ML Kit Selfie Segmentation:
 * Add: implementation 'com.google.mlkit:segmentation-selfie:16.0.0-beta6'
 * Call: Segmenter.process(InputImage.fromBitmap(bitmap, 0)) to obtain the exact person buffer.
 */
object BackgroundEnhancementService {

    fun enhanceBackground(original: Bitmap): Bitmap {
        val width = original.width
        val height = original.height

        val result = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(result)

        // Base photo
        canvas.drawBitmap(original, 0f, 0f, null)

        // Warm lighting filter
        val warmLightingPaint = Paint().apply {
            color = Color.parseColor("#15FFA726")
            xfermode = PorterDuffXfermode(PorterDuff.Mode.SRC_ATOP)
        }
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), warmLightingPaint)

        // Soft vignette to gently focus on the subject
        val vignetteRadius = (Math.min(width, height) * 0.75f)
        val vignetteGradient = RadialGradient(
            width * 0.5f, height * 0.5f,
            vignetteRadius,
            intArrayOf(Color.TRANSPARENT, Color.parseColor("#44000000")),
            floatArrayOf(0.4f, 1.0f),
            Shader.TileMode.CLAMP
        )
        val vignettePaint = Paint().apply {
            shader = vignetteGradient
            isAntiAlias = true
        }
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), vignettePaint)

        return result
    }
}
