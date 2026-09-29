package com.posecam.app.storage

import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Log
import java.io.File
import java.io.FileInputStream
import java.io.OutputStream
import java.text.SimpleDateFormat
import java.util.Locale

/**
 * LocalStorageManager
 * 
 * Uses modern Android MediaStore Scoped Storage APIs to save photos
 * into the standard system Pictures/PoseCam directory.
 * No deprecated storage permissions (such as WRITE_EXTERNAL_STORAGE) required on Android 10+.
 */
object LocalStorageManager {

    private const val TAG = "LocalStorageManager"

    fun saveImageToMediaStore(context: Context, sourceFile: File): Uri? {
        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(System.currentTimeMillis())
        val displayName = "PoseCam_$timestamp.jpg"

        val values = ContentValues().apply {
            put(MediaStore.Images.Media.DISPLAY_NAME, displayName)
            put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/PoseCam")
                put(MediaStore.Images.Media.IS_PENDING, 1)
            }
        }

        val resolver = context.contentResolver
        var imageUri: Uri? = null

        try {
            imageUri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
            if (imageUri != null) {
                resolver.openOutputStream(imageUri)?.use { outStream: OutputStream ->
                    FileInputStream(sourceFile).use { inStream ->
                        inStream.copyTo(outStream)
                    }
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    values.clear()
                    values.put(MediaStore.Images.Media.IS_PENDING, 0)
                    resolver.update(imageUri, values, null, null)
                }
                Log.d(TAG, "Image successfully saved to MediaStore: $imageUri")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to save image to MediaStore", e)
            if (imageUri != null) {
                resolver.delete(imageUri, null, null)
                imageUri = null
            }
        }

        return imageUri
    }
}
