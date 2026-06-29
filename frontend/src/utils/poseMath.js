export function calculateAngle(a, b, c) {
  if (!a || !b || !c) return 0;
  let angle = (Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)) * (180.0 / Math.PI);
  angle = Math.abs(angle);
  if (angle > 180) {
    angle = 360 - angle;
  }
  return angle;
}

// Check alignment for Warrior II
export function checkWarriorII(landmarks) {
  const r_shoulder = landmarks[12];
  const r_elbow = landmarks[14];
  const r_wrist = landmarks[16];
  const l_shoulder = landmarks[11];
  const l_elbow = landmarks[13];
  const l_wrist = landmarks[15];

  const r_hip = landmarks[24];
  const r_knee = landmarks[26];
  const r_ankle = landmarks[28];
  const l_hip = landmarks[23];
  const l_knee = landmarks[25];
  const l_ankle = landmarks[27];

  // Arm straightness check (y diff should be small)
  const arms_horizontal = 
    Math.abs(r_shoulder.y - r_wrist.y) < 0.12 && 
    Math.abs(r_shoulder.y - r_elbow.y) < 0.12 &&
    Math.abs(l_shoulder.y - l_wrist.y) < 0.12 &&
    Math.abs(l_shoulder.y - l_elbow.y) < 0.12;

  const rightKneeAngle = calculateAngle(r_hip, r_knee, r_ankle);
  const leftKneeAngle = calculateAngle(l_hip, l_knee, l_ankle);

  const isRightBent = rightKneeAngle < 135 && rightKneeAngle > 80;
  const isLeftStraight = leftKneeAngle > 150;
  
  const isLeftBent = leftKneeAngle < 135 && leftKneeAngle > 80;
  const isRightStraight = rightKneeAngle > 150;

  const legs_ok = (isRightBent && isLeftStraight) || (isLeftBent && isRightStraight);

  let feedback = "Hold Warrior II Pose";
  let met = [arms_horizontal, isRightBent || isLeftBent, legs_ok];

  if (!arms_horizontal) {
    feedback = "Extend your arms out parallel to the floor 👐";
  } else if (!(isRightBent || isLeftBent)) {
    feedback = "Bend your front knee deeply (~90 deg) 🧘";
  } else if (!legs_ok) {
    feedback = "Straighten your back leg completely 🦵";
  } else {
    feedback = "Perfect Warrior II! Keep holding! ✅";
  }

  // Calculate score based on joint configurations
  let score = 50;
  if (arms_horizontal) score += 25;
  if (legs_ok) score += 25;

  return {
    met,
    feedback,
    accuracy: score,
    poseComplete: arms_horizontal && legs_ok
  };
}

// Check alignment for Tree Pose
export function checkTree(landmarks) {
  const r_shoulder = landmarks[12];
  const r_wrist = landmarks[16];
  const l_shoulder = landmarks[11];
  const l_wrist = landmarks[15];

  const r_hip = landmarks[24];
  const r_knee = landmarks[26];
  const r_ankle = landmarks[28];
  const l_hip = landmarks[23];
  const l_knee = landmarks[25];
  const l_ankle = landmarks[27];

  const rightKneeAngle = calculateAngle(r_hip, r_knee, r_ankle);
  const leftKneeAngle = calculateAngle(l_hip, l_knee, l_ankle);

  const leftStanding = leftKneeAngle > 155 && rightKneeAngle < 135;
  const rightStanding = rightKneeAngle > 155 && leftKneeAngle < 135;
  const legs_ok = leftStanding || rightStanding;

  const hands_up = l_wrist.y < l_shoulder.y && r_wrist.y < r_shoulder.y;
  const hands_together = Math.abs(l_wrist.x - r_wrist.x) < 0.15;

  let feedback = "Hold Tree Pose";
  let met = [hands_up, hands_together, legs_ok];

  if (!hands_up) {
    feedback = "Raise your hands high above your head 👐";
  } else if (!hands_together) {
    feedback = "Bring your palms close together in prayer position 🧘";
  } else if (!legs_ok) {
    feedback = "Place sole of foot against inner thigh of opposite leg 🦵";
  } else {
    feedback = "Perfect Tree Pose! Balance and breathe! ✅";
  }

  let score = 40;
  if (hands_up) score += 20;
  if (hands_together) score += 20;
  if (legs_ok) score += 20;

  return {
    met,
    feedback,
    accuracy: score,
    poseComplete: hands_up && hands_together && legs_ok
  };
}

// Check alignment for Plank Pose
export function checkPlank(landmarks) {
  const r_shoulder = landmarks[12];
  const r_hip = landmarks[24];
  const r_knee = landmarks[26];
  const r_ankle = landmarks[28];

  const l_shoulder = landmarks[11];
  const l_hip = landmarks[23];
  const l_knee = landmarks[25];
  const l_ankle = landmarks[27];

  const rHipAngle = calculateAngle(r_shoulder, r_hip, r_knee);
  const lHipAngle = calculateAngle(l_shoulder, l_hip, l_knee);
  const rKneeAngle = calculateAngle(r_hip, r_knee, r_ankle);
  const lKneeAngle = calculateAngle(l_hip, l_knee, l_ankle);

  const hip_straight = Math.abs(rHipAngle - 180) < 25 && Math.abs(lHipAngle - 180) < 25;
  const knees_straight = Math.abs(rKneeAngle - 180) < 25 && Math.abs(lKneeAngle - 180) < 25;
  const hip_level_ok = (r_hip.y > r_shoulder.y - 0.05) && (r_hip.y < r_ankle.y + 0.05);

  let feedback = "Hold Plank Pose";
  let met = [hip_straight, knees_straight, hip_level_ok];

  if (!hip_straight) {
    feedback = "Align your hips. Keep your body in a straight line ⬇️";
  } else if (!knees_straight) {
    feedback = "Straighten your knees. Push up from your heels 🦵";
  } else if (!hip_level_ok) {
    feedback = "Engage your core. Do not let your hips sag 🧘";
  } else {
    feedback = "Perfect Plank! Keep core engaged! ✅";
  }

  let score = 40;
  if (hip_straight) score += 30;
  if (knees_straight) score += 30;

  return {
    met,
    feedback,
    accuracy: score,
    poseComplete: hip_straight && knees_straight && hip_level_ok
  };
}

// Check alignment for Chair Pose
export function checkChair(landmarks) {
  const r_shoulder = landmarks[12];
  const r_hip = landmarks[24];
  const r_knee = landmarks[26];
  const r_ankle = landmarks[28];

  const l_shoulder = landmarks[11];
  const l_hip = landmarks[23];
  const l_knee = landmarks[25];
  const l_ankle = landmarks[27];

  const r_wrist = landmarks[16];
  const l_wrist = landmarks[15];

  const rightKneeAngle = calculateAngle(r_hip, r_knee, r_ankle);
  const leftKneeAngle = calculateAngle(l_hip, l_knee, l_ankle);
  const rHipAngle = calculateAngle(r_shoulder, r_hip, r_knee);
  const lHipAngle = calculateAngle(l_shoulder, l_hip, l_knee);

  const knees_bent = rightKneeAngle < 150 && leftKneeAngle < 150;
  const arms_up = r_wrist.y < r_shoulder.y && l_wrist.y < l_shoulder.y;
  const back_straight = rHipAngle > 90 && lHipAngle > 90;

  let feedback = "Hold Chair Pose";
  let met = [knees_bent, arms_up, back_straight];

  if (!knees_bent) {
    feedback = "Bend your knees deeper, as if sitting in a chair ⬇️";
  } else if (!arms_up) {
    feedback = "Extend your arms overhead 👐";
  } else if (!back_straight) {
    feedback = "Keep your spine long and chest lifted ⬆️";
  } else {
    feedback = "Perfect Chair Pose! Breathe and hold! ✅";
  }

  let score = 40;
  if (knees_bent) score += 30;
  if (arms_up) score += 30;

  return {
    met,
    feedback,
    accuracy: score,
    poseComplete: knees_bent && arms_up && back_straight
  };
}

// Check alignment for Goddess Pose
export function checkGoddess(landmarks) {
  const r_shoulder = landmarks[12];
  const r_hip = landmarks[24];
  const r_knee = landmarks[26];
  const r_ankle = landmarks[28];

  const l_shoulder = landmarks[11];
  const l_hip = landmarks[23];
  const l_knee = landmarks[25];
  const l_ankle = landmarks[27];

  const r_elbow = landmarks[14];
  const l_elbow = landmarks[13];
  const r_wrist = landmarks[16];
  const l_wrist = landmarks[15];

  const rightKneeAngle = calculateAngle(r_hip, r_knee, r_ankle);
  const leftKneeAngle = calculateAngle(l_hip, l_knee, l_ankle);

  const ankle_dist = Math.abs(r_ankle.x - l_ankle.x);
  const shoulder_dist = Math.abs(r_shoulder.x - l_shoulder.x);
  const wide_stance = ankle_dist > (shoulder_dist * 1.5);

  const knees_bent = rightKneeAngle < 150 && leftKneeAngle < 150;
  const arms_cactus = r_wrist.y < r_elbow.y && l_wrist.y < l_elbow.y;

  let feedback = "Hold Goddess Pose";
  let met = [wide_stance, knees_bent, arms_cactus];

  if (!wide_stance) {
    feedback = "Step your feet wider apart on the mat ↔️";
  } else if (!knees_bent) {
    feedback = "Bend your knees deeply to lower your hips ⬇️";
  } else if (!arms_cactus) {
    feedback = "Raise hands, bend elbows to 90 degrees (cactus arms) 👐";
  } else {
    feedback = "Perfect Goddess Pose! Feel the strength! ✅";
  }

  let score = 40;
  if (wide_stance) score += 20;
  if (knees_bent) score += 20;
  if (arms_cactus) score += 20;

  return {
    met,
    feedback,
    accuracy: score,
    poseComplete: wide_stance && knees_bent && arms_cactus
  };
}

// Squats rep counter logic
export function checkSquat(landmarks, currentStage) {
  const r_hip = landmarks[24];
  const r_knee = landmarks[26];
  const r_ankle = landmarks[28];
  
  const angle = calculateAngle(r_hip, r_knee, r_ankle);
  let stage = currentStage;
  let repCounted = false;
  let feedback = "Stand Tall";
  
  if (angle > 165) {
    stage = "up";
    feedback = "Stand tall 🧍";
  } else if (angle < 95 && stage === "up") {
    stage = "down";
    repCounted = true;
    feedback = "Good depth! ✅";
  } else if (angle < 95) {
    feedback = "Good depth! ✅";
  } else {
    feedback = "Lower your hips down ⬇️";
  }

  return {
    stage,
    repCounted,
    feedback,
    accuracy: Math.max(50, Math.min(100, Math.round(180 - angle))), // map angle to score
    met: [true, angle < 100, angle > 165]
  };
}
