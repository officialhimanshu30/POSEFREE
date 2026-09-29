package com.posecam.app.pose

enum class PoseCategory(val displayName: String) {
    STANDING("Standing"),
    SITTING("Sitting"),
    SELFIE("Selfie"),
    WALKING("Walking")
}

data class PoseTemplate(
    val id: String,
    val name: String,
    val category: PoseCategory,
    val description: String,
    val tip: String,
    val recommendedAngle: String
)

object PoseCatalog {
    private val poses = listOf(
        // Standing 01 through Standing 25
        PoseTemplate("standing-01", "Standing 01", PoseCategory.STANDING, "Power stance with hands on hips and elbows angled outward.", "Hold camera at chest level. Tilt chin up slightly.", "Chest Level • 1.0x"),
        PoseTemplate("standing-02", "Standing 02", PoseCategory.STANDING, "Casual wall lean with crossed ankles and shoulders tilted.", "Camera at waist level. Lean lightly against wall.", "Waist Level • 1.2x"),
        PoseTemplate("standing-03", "Standing 03", PoseCategory.STANDING, "Over-the-shoulder turn, back partially facing camera.", "Leave negative space in the direction you look.", "Eye Level • 1.5x"),
        PoseTemplate("standing-04", "Standing 04", PoseCategory.STANDING, "Hand in front pocket with relaxed weight shift.", "Shift weight onto rear foot for organic diagonal.", "Eye Level • 1.0x"),
        PoseTemplate("standing-05", "Standing 05", PoseCategory.STANDING, "Crossed arms confident stance with squared shoulders.", "Rest hands softly over biceps.", "Chest Level • 1.0x"),
        PoseTemplate("standing-06", "Standing 06", PoseCategory.STANDING, "One hand touching hair with slight head tilt.", "Gently tuck hair behind ear.", "Eye Level • 1.2x"),
        PoseTemplate("standing-07", "Standing 07", PoseCategory.STANDING, "Runway walking stance with one foot stepping forward.", "Hold pose mid-step for crisp motion capture.", "Knee-to-Waist • 1.0x"),
        PoseTemplate("standing-08", "Standing 08", PoseCategory.STANDING, "Side profile full-length silhouette with posture elongated.", "Drop shoulders down and back, lengthen neck.", "Full Height • 1.0x"),
        PoseTemplate("standing-09", "Standing 09", PoseCategory.STANDING, "Hand resting on jacket collar or lapel.", "Ideal for outerwear and structured outfits.", "Chest Level • 1.0x"),
        PoseTemplate("standing-10", "Standing 10", PoseCategory.STANDING, "Wide high-fashion editorial stance.", "Take up horizontal space to communicate confidence.", "Low Angle • 1.0x"),
        PoseTemplate("standing-11", "Standing 11", PoseCategory.STANDING, "Gentle forward lean with weight on front foot.", "Leaning toward camera creates intimacy and presence.", "Eye Level • 1.2x"),
        PoseTemplate("standing-12", "Standing 12", PoseCategory.STANDING, "3/4 turn back stance with hand placed on natural waist.", "Accentuates waistline and shoulder angles.", "Chest Level • 1.2x"),
        PoseTemplate("standing-13", "Standing 13", PoseCategory.STANDING, "Minimalist relaxed stance with arms dropping naturally.", "Keep fingers gently curved rather than stiff.", "Full Height • 1.0x"),
        PoseTemplate("standing-14", "Standing 14", PoseCategory.STANDING, "Thoughtful posture with index finger resting on jawline.", "Direct gaze slightly off-camera.", "Chest-to-Head • 1.2x"),
        PoseTemplate("standing-15", "Standing 15", PoseCategory.STANDING, "Classic S-curve posture with hip pop and gentle head angle.", "Shift 80% of weight to back foot.", "Waist Level • 1.0x"),
        PoseTemplate("standing-16", "Standing 16", PoseCategory.STANDING, "Both hands in front pockets with relaxed dropped shoulders.", "Leave thumbs hooked outside pockets.", "Chest Level • 1.0x"),
        PoseTemplate("standing-17", "Standing 17", PoseCategory.STANDING, "One foot propped back against vertical surface.", "Adds casual depth to urban portraits.", "Waist Level • 1.0x"),
        PoseTemplate("standing-18", "Standing 18", PoseCategory.STANDING, "Hands gently clasped in front with tall poised posture.", "Ideal for professional and formal headshots.", "Chest Level • 1.0x"),
        PoseTemplate("standing-19", "Standing 19", PoseCategory.STANDING, "Dynamic asymmetrical stand with one arm raised.", "Brings spontaneous energetic motion.", "Eye Level • 1.0x"),
        PoseTemplate("standing-20", "Standing 20", PoseCategory.STANDING, "Crossed legs frontal stance with elongated vertical line.", "Crossing feet slims the lower silhouette.", "Full Body • 1.0x"),
        PoseTemplate("standing-21", "Standing 21", PoseCategory.STANDING, "Rear view with shoulders squared and head turned 45 degrees.", "Highlights back details and hair styling.", "Chest Level • 1.2x"),
        PoseTemplate("standing-22", "Standing 22", PoseCategory.STANDING, "Asymmetric stance with one hand on hip, opposite loose.", "Creates balanced geometry.", "Eye Level • 1.0x"),
        PoseTemplate("standing-23", "Standing 23", PoseCategory.STANDING, "Casual street lean with front knee angled forward.", "Bends the knee forward to break visual monotony.", "Waist Level • 1.0x"),
        PoseTemplate("standing-24", "Standing 24", PoseCategory.STANDING, "Dynamic diagonal weight shift with asymmetric shoulders.", "Raise one shoulder slightly for editorial edge.", "Low Angle • 1.2x"),
        PoseTemplate("standing-25", "Standing 25", PoseCategory.STANDING, "Formal red carpet stance with symmetrical elegance.", "Hold shoulders back, chin parallel to floor.", "Chest Level • 1.0x"),
        PoseTemplate(
            id = "sit-1",
            name = "Coffee Shop Relaxed",
            category = PoseCategory.SITTING,
            description = "Casual seated posture leaning forward over table.",
            tip = "Place camera at table height for an intimate cafe aesthetic.",
            recommendedAngle = "Table Height • 1.0x"
        ),
        PoseTemplate(
            id = "sit-2",
            name = "Chair Angle Cross",
            category = PoseCategory.SITTING,
            description = "Knees crossed at 45 degree angle for slimming depth.",
            tip = "Angle body slightly away from camera.",
            recommendedAngle = "Knee Height • 1.2x"
        ),
        PoseTemplate(
            id = "selfie-1",
            name = "High Angle 45°",
            category = PoseCategory.SELFIE,
            description = "Classic elevated selfie angle defining jawline.",
            tip = "Hold phone above forehead and tilt downward 30 degrees.",
            recommendedAngle = "Elevated 45° • Front Cam"
        ),
        PoseTemplate(
            id = "selfie-2",
            name = "Chin Support Hand",
            category = PoseCategory.SELFIE,
            description = "Resting jawline gently on fingers for elegant framing.",
            tip = "Touch cheek softly to avoid skin distortion.",
            recommendedAngle = "Eye Level • Front Cam"
        ),
        PoseTemplate(
            id = "walk-1",
            name = "Mid-Stride Street Look",
            category = PoseCategory.WALKING,
            description = "Natural walking stride captured at apex of movement.",
            tip = "Walk toward camera slowly at 30% normal pace.",
            recommendedAngle = "Knee-to-Waist • 1.0x"
        )
    )

    fun getAllPoses(): List<PoseTemplate> = poses

    fun getPosesByCategory(category: PoseCategory): List<PoseTemplate> =
        poses.filter { it.category == category }

    fun getPoseById(id: String): PoseTemplate? =
        poses.find { it.id == id }
}
