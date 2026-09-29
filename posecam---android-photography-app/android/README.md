# PoseCam - Android Studio Photography App (Kotlin)

A modern Android photography application in Kotlin where users select a pose template from a categorized gallery, view a semi-transparent guide overlay on the live camera stream, position themselves, capture real photos, and optionally enhance the background lighting/colors while keeping their face/body unaltered.

## Architecture Highlights
- **100% Kotlin & Android Jetpack** (Lifecycle, ViewModel, ViewBinding).
- **CameraX** for smooth camera lifecycle management, front/rear camera flip, zero-lag shutter, and self-timer (3s/5s).
- **Separated Overlay Layer**: The visual pose guide is rendered on a dedicated custom view (`PoseOverlayView`) above `PreviewView`. It **never** alters or bakes into the raw captured photo data.
- **Background Enhancement Service**: Pure subject-preserving lighting, color warmth, and depth blur. Designed for seamless plug-in of Google ML Kit Selfie Segmentation (`com.google.mlkit:segmentation-selfie`).
- **Modern Local Storage**: Uses `MediaStore` Scoped Storage (`Pictures/PoseCam`) with zero deprecated permissions on Android 10+.
- **Google Mobile Ads (AdMob)**: Includes persistent test banner on Home Screen and preloaded Interstitial test ad shown strictly at natural post-save / post-enhance transitions.

---

## Getting Started in Android Studio

### 1. Open Project
1. Launch **Android Studio** (Hedgehog, Iguana, Jellyfish, or newer).
2. Choose **File > Open** and select the `android/` directory (or extract the downloaded `PoseCam-Android-Studio-Project.zip`).
3. Allow Gradle to sync dependencies automatically.

### 2. Run on Device / Emulator
- Select an Android device or emulator running **API 24 (Android 7.0) to API 35 (Android 15)**.
- Press **Run 'app'** (`Shift + F10`).
- Accept the Camera permission prompt to begin shooting.

---

## AdMob Configuration Guide

The project comes pre-configured with **official Google AdMob Test Unit IDs**:
- **Application ID**: `ca-app-pub-3940256099942544~3347511713` (in `AndroidManifest.xml`)
- **Banner Test ID**: `ca-app-pub-3940256099942544/6300978111` (in `AdMobManager.kt`)
- **Interstitial Test ID**: `ca-app-pub-3940256099942544/1033173712` (in `AdMobManager.kt`)

### Switching to Production:
1. Register your app in the [Google AdMob Console](https://admob.google.com).
2. Replace `meta-data com.google.android.gms.ads.APPLICATION_ID` in `AndroidManifest.xml` with your production App ID.
3. Replace the test unit strings in `AdMobManager.kt` with your production Banner & Interstitial IDs.
