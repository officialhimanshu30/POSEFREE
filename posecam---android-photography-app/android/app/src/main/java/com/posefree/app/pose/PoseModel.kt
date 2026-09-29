package com.posefree.app.pose

enum class PoseCategory(val displayName: String) {
    STANDING("Standing"),
    SITTING("Sitting"),
    COUPLE("Couple")
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
        // Sitting 01 through Sitting 18
        PoseTemplate("sitting-01", "Sitting 01", PoseCategory.SITTING, "Casual coffee shop lean with arms relaxed on surface.", "Place camera at table height for intimate aesthetic.", "Table Height • 1.0x"),
        PoseTemplate("sitting-02", "Sitting 02", PoseCategory.SITTING, "Crossed knee seated angle with relaxed hand clasp.", "Angle body 45 degrees relative to lens for depth.", "Knee Height • 1.2x"),
        PoseTemplate("sitting-03", "Sitting 03", PoseCategory.SITTING, "Stair step lounge with knees elevated and leaning back.", "Low angle shot upward gives dramatic lifestyle presence.", "Low Angle • 1.0x"),
        PoseTemplate("sitting-04", "Sitting 04", PoseCategory.SITTING, "Forward seated posture resting chin gently on knuckles.", "Keep elbow on knee for grounded composure.", "Eye Level • 1.2x"),
        PoseTemplate("sitting-05", "Sitting 05", PoseCategory.SITTING, "Armchair side profile with elongated spine.", "Drop shoulders and elongate neck line.", "Chest Level • 1.0x"),
        PoseTemplate("sitting-06", "Sitting 06", PoseCategory.SITTING, "Ground cross-legged meditation poise.", "Keep spine neutral, hands resting on knees.", "Waist Level • 1.0x"),
        PoseTemplate("sitting-07", "Sitting 07", PoseCategory.SITTING, "Edge of chair lean forward with hands on thighs.", "Creates engaging forward presence toward lens.", "Eye Level • 1.0x"),
        PoseTemplate("sitting-08", "Sitting 08", PoseCategory.SITTING, "One leg extended forward with opposite knee bent.", "Elongates legs visually in full body framing.", "Low Angle • 1.0x"),
        PoseTemplate("sitting-09", "Sitting 09", PoseCategory.SITTING, "Lounge sofa diagonal with arms spread across backrest.", "Captures effortless confidence.", "Eye Level • 1.2x"),
        PoseTemplate("sitting-10", "Sitting 10", PoseCategory.SITTING, "Cafe window turn looking outward away from camera.", "Natural ambient side illumination.", "Chest Level • 1.5x"),
        PoseTemplate("sitting-11", "Sitting 11", PoseCategory.SITTING, "Hands clasped between knees leaning forward.", "Gives candid, attentive atmosphere.", "Eye Level • 1.0x"),
        PoseTemplate("sitting-12", "Sitting 12", PoseCategory.SITTING, "Casual floor lean with back against wall.", "Bend one knee up, keep one flat.", "Waist Level • 1.0x"),
        PoseTemplate("sitting-13", "Sitting 13", PoseCategory.SITTING, "Stool perch with one foot on lower rung.", "Creates vertical dynamic on high seating.", "Full Height • 1.0x"),
        PoseTemplate("sitting-14", "Sitting 14", PoseCategory.SITTING, "Relaxed slouch with head tilted and hand on lapel.", "Soft relaxed shoulders for casual mood.", "Chest Level • 1.2x"),
        PoseTemplate("sitting-15", "Sitting 15", PoseCategory.SITTING, "Reading / Tablet gaze seated posture.", "Hands holding book/drink for organic activity.", "Table Height • 1.0x"),
        PoseTemplate("sitting-16", "Sitting 16", PoseCategory.SITTING, "Backward chair mount with arms over chair back.", "Classic editorial model seating.", "Chest Level • 1.0x"),
        PoseTemplate("sitting-17", "Sitting 17", PoseCategory.SITTING, "Low bench posture with ankle crossed over knee.", "Classic relaxed menswear/casual position.", "Knee Height • 1.0x"),
        PoseTemplate("sitting-18", "Sitting 18", PoseCategory.SITTING, "Formal executive seated poise with hands laced.", "Tall upright posture for professional headshots.", "Eye Level • 1.0x"),
        // Couple 01 through Couple 15
        PoseTemplate("couple-01", "Couple 01", PoseCategory.COUPLE, "Side by side close stance with gentle hand hold.", "Keep camera at chest level. Tilt shoulders slightly inward.", "Chest Level • 1.0x"),
        PoseTemplate("couple-02", "Couple 02", PoseCategory.COUPLE, "Romantic forehead touch with soft profile silhouette.", "Slight low angle looking up between faces.", "Eye Level • 1.2x"),
        PoseTemplate("couple-03", "Couple 03", PoseCategory.COUPLE, "Back hug with arms wrapped around waist.", "Natural candid smile toward camera or off-angle.", "Waist Level • 1.0x"),
        PoseTemplate("couple-04", "Couple 04", PoseCategory.COUPLE, "Whispering candid smile with eyes closed.", "Close-up portrait framing with shallow depth of field.", "Chest Level • 1.4x"),
        PoseTemplate("couple-05", "Couple 05", PoseCategory.COUPLE, "Walking together looking at each other.", "Step in sync and capture mid-stride.", "Full Body • 1.0x"),
        PoseTemplate("couple-06", "Couple 06", PoseCategory.COUPLE, "Sunset silhouette leaning on balcony or wall.", "Position couple against backlight for dramatic outlines.", "Waist Level • 1.0x"),
        PoseTemplate("couple-07", "Couple 07", PoseCategory.COUPLE, "Head resting on shoulder seated comfortably.", "Warm cozy vibe, camera at eye level.", "Eye Level • 1.2x"),
        PoseTemplate("couple-08", "Couple 08", PoseCategory.COUPLE, "Dip and swirl playful celebration pose.", "Low angle enhances dynamic movement.", "Low Angle • 1.0x"),
        PoseTemplate("couple-09", "Couple 09", PoseCategory.COUPLE, "Piggyback joyful candid laugh.", "Use burst mode for authentic smile and motion.", "Eye Level • 1.0x"),
        PoseTemplate("couple-10", "Couple 10", PoseCategory.COUPLE, "Hand-in-hand leading toward background view.", "Follow-me perspective with arm leading into frame.", "Waist Level • 1.0x"),
        PoseTemplate("couple-11", "Couple 11", PoseCategory.COUPLE, "Cheek to cheek close intimate portrait.", "Tilt chins inward toward center axis.", "Chest Level • 1.2x"),
        PoseTemplate("couple-12", "Couple 12", PoseCategory.COUPLE, "Joyful lift off feet in mid-spin celebration.", "Slight low angle looking up enhances height.", "Low Angle • 1.0x"),
        PoseTemplate("couple-13", "Couple 13", PoseCategory.COUPLE, "Bench seated cuddle with arms around shoulders.", "Relaxed cozy mood at natural eye horizon.", "Eye Level • 1.0x"),
        PoseTemplate("couple-14", "Couple 14", PoseCategory.COUPLE, "Slow dance spin with arms gracefully linked.", "Capture natural fluid movement.", "Full Body • 1.0x"),
        PoseTemplate("couple-15", "Couple 15", PoseCategory.COUPLE, "Golden hour candid gaze facing each other.", "Backlit warm glow framing silhouettes.", "Chest Level • 1.2x")
    )

    fun getAllPoses(): List<PoseTemplate> = poses

    fun getPosesByCategory(category: PoseCategory): List<PoseTemplate> =
        poses.filter { it.category == category }

    fun getPoseById(id: String): PoseTemplate? =
        poses.find { it.id == id }
}
