'use client';

import { getFirebase } from "@/lib/firebaseClient"; // Ensure this path is correct

/**
 * Represents an exercise.
 */
export interface Exercise {
  /**
   * The name of the exercise.
   */
  name: string;
  /**
   * A description of the exercise.
   */
  description: string;
  /**
   * The muscle group targeted by the exercise.
   */
  muscleGroup: string;
  /**
   * Text-based tutorial on how to perform the exercise.
   */
  tutorial: string;
  /**
   * AI hint for image generation (though images are being removed).
   */
  imageHint?: string;
}

/**
 * Fetches exercises.
 * Uses demo data for now.
 * @returns A promise resolving to an array of Exercise objects.
 */
export async function getExercises(): Promise<Exercise[]> {
  // Demo data with tutorials
  const exercises: Exercise[] = [
    // Chest
    {
      name: 'Bench Press (Barbell)',
      description: 'Compound exercise targeting the chest, shoulders, and triceps.',
      muscleGroup: 'Chest',
      tutorial: `1. Lie flat on a bench with your feet flat on the floor.
2. Grip the barbell slightly wider than shoulder-width apart, palms facing up.
3. Unrack the bar and lower it slowly to your mid-chest, keeping your elbows tucked slightly.
4. Pause briefly, then push the bar back up explosively until your arms are fully extended.
5. Repeat for the desired number of repetitions.`,
      imageHint: 'barbell bench press',
    },
    {
      name: 'Incline Dumbbell Press',
      description: 'Targets the upper chest muscles.',
      muscleGroup: 'Chest',
      tutorial: `1. Set an incline bench to a 30-45 degree angle.
2. Sit on the bench holding a dumbbell in each hand, resting them on your thighs.
3. Lie back and bring the dumbbells to the sides of your chest, palms facing forward.
4. Press the dumbbells straight up until your arms are extended, but not locked.
5. Slowly lower the dumbbells back to the starting position.
6. Repeat.`,
      imageHint: 'incline dumbbell press',
    },
    {
      name: 'Dumbbell Flyes',
      description: 'Isolation exercise for stretching and contracting the chest.',
      muscleGroup: 'Chest',
      tutorial: `1. Lie flat on a bench holding a dumbbell in each hand above your chest, palms facing each other, slight bend in the elbows.
2. Slowly lower the dumbbells out to your sides in a wide arc, maintaining the slight elbow bend. Feel the stretch in your chest.
3. Bring the dumbbells back up to the starting position using your chest muscles.
4. Repeat.`,
      imageHint: 'dumbbell flyes',
    },
    {
      name: 'Push-ups',
      description: 'Bodyweight exercise for chest, shoulders, and triceps.',
      muscleGroup: 'Chest',
      tutorial: `1. Start in a high plank position with hands slightly wider than shoulder-width apart, fingers pointing forward.
2. Keep your body in a straight line from head to heels. Engage your core.
3. Lower your chest towards the ground by bending your elbows, keeping them relatively close to your body.
4. Push back up to the starting position until your arms are extended.
5. Repeat.`,
      imageHint: 'push up',
    },
    // Back
    {
      name: 'Pull-ups',
      description: 'Compound bodyweight exercise targeting the back and biceps.',
      muscleGroup: 'Back',
      tutorial: `1. Grip a pull-up bar with palms facing away (overhand grip), slightly wider than shoulder-width.
2. Hang with arms fully extended, engaging your shoulders.
3. Pull your chest towards the bar by driving your elbows down and back.
4. Pause when your chin is over the bar.
5. Slowly lower yourself back to the starting position.
6. Repeat. (Use assisted machine or bands if needed).`,
      imageHint: 'pull up',
    },
    {
      name: 'Bent-Over Rows (Barbell)',
      description: 'Compound exercise for overall back thickness.',
      muscleGroup: 'Back',
      tutorial: `1. Stand with feet shoulder-width apart, knees slightly bent. Hinge at your hips, keeping your back straight, until your torso is nearly parallel to the floor.
2. Grip the barbell with an overhand grip, slightly wider than shoulder-width. Let it hang towards the floor.
3. Pull the barbell towards your lower chest/upper abdomen, squeezing your shoulder blades together.
4. Slowly lower the bar back to the starting position.
5. Repeat.`,
      imageHint: 'barbell row',
    },
    {
      name: 'Lat Pulldowns',
      description: 'Machine exercise targeting the latissimus dorsi.',
      muscleGroup: 'Back',
      tutorial: `1. Sit at the lat pulldown machine, adjusting the knee pad to secure your legs.
2. Grip the bar with an overhand grip, wider than shoulder-width.
3. Lean back slightly, keeping your chest up and back straight.
4. Pull the bar down towards your upper chest, leading with your elbows and squeezing your lats.
5. Slowly return the bar to the starting position, controlling the movement.
6. Repeat.`,
      imageHint: 'lat pulldown machine',
    },
    {
      name: 'Seated Cable Rows',
      description: 'Targets the middle back muscles.',
      muscleGroup: 'Back',
      tutorial: `1. Sit at a cable row machine with feet planted firmly on the platform, knees slightly bent.
2. Grip the handle (e.g., V-bar) with a neutral grip. Sit upright with your back straight and chest out.
3. Pull the handle towards your torso, squeezing your shoulder blades together. Keep your elbows close to your body.
4. Slowly extend your arms back to the starting position, feeling the stretch in your back.
5. Repeat.`,
      imageHint: 'seated cable row',
    },
    // Legs
    {
      name: 'Squats (Barbell)',
      description: 'Fundamental compound exercise for legs and glutes.',
      muscleGroup: 'Legs',
      tutorial: `1. Stand with feet shoulder-width apart, toes slightly pointed out. Place the barbell across your upper back (traps), not your neck.
2. Keep your chest up, core engaged, and back straight.
3. Lower down by bending your knees and hips, as if sitting in a chair. Keep your weight on your heels. Go as deep as comfortable, ideally thighs parallel to the floor or lower.
4. Drive back up through your heels to the starting position.
5. Repeat.`,
      imageHint: 'barbell squat',
    },
    {
      name: 'Deadlifts (Conventional)',
      description: 'Full-body compound lift emphasizing posterior chain.',
      muscleGroup: 'Legs',
      tutorial: `1. Stand with mid-foot under the barbell, feet hip-width apart.
2. Hinge at hips and bend knees to grip the bar just outside your legs (mixed or double overhand grip). Keep your back straight, chest up, shoulders pulled back.
3. Drive through your heels, lifting the bar by extending your hips and knees simultaneously. Keep the bar close to your body.
4. Stand tall, locking out hips and knees.
5. Lower the bar by reversing the motion, hinging at hips first, then bending knees. Maintain a straight back.
6. Repeat.`,
      imageHint: 'deadlift',
    },
    {
      name: 'Leg Press',
      description: 'Machine exercise targeting quads, hamstrings, and glutes.',
      muscleGroup: 'Legs',
      tutorial: `1. Sit on the leg press machine, placing your feet shoulder-width apart on the platform.
2. Ensure your back and head are flat against the pads.
3. Unlock the safety bars and slowly lower the platform by bending your knees until they form roughly a 90-degree angle (avoid letting your lower back lift off the pad).
4. Push the platform back up through your heels until your legs are nearly extended (do not lock knees).
5. Repeat.`,
      imageHint: 'leg press machine',
    },
    {
      name: 'Lunges (Dumbbell)',
      description: 'Unilateral exercise for legs and balance.',
      muscleGroup: 'Legs',
      tutorial: `1. Stand tall holding a dumbbell in each hand at your sides.
2. Step forward with one leg, lowering your hips until both knees are bent at approximately 90 degrees. Ensure your front knee stays behind your toes and your back knee hovers just above the ground.
3. Push off your front foot to return to the starting position.
4. Repeat, alternating legs or completing all reps for one leg before switching.`,
      imageHint: 'dumbbell lunge',
    },
    {
      name: 'Hamstring Curls',
      description: 'Isolation exercise for the hamstrings.',
      muscleGroup: 'Legs',
      tutorial: `1. Adjust the hamstring curl machine (lying or seated) to fit your body.
2. Position yourself according to the machine type (lie face down or sit). Place the back of your lower legs/ankles under the padded lever.
3. Curl the weight towards your glutes by contracting your hamstrings.
4. Slowly lower the weight back to the starting position with control.
5. Repeat.`,
      imageHint: 'hamstring curl machine',
    },
    {
      name: 'Calf Raises',
      description: 'Targets the calf muscles.',
      muscleGroup: 'Legs',
      tutorial: `1. Stand with the balls of your feet on an elevated surface (like a step or weight plate), heels hanging off. Hold onto something for balance if needed.
2. Slowly lower your heels as far as comfortable to feel a stretch in your calves.
3. Push up onto your tiptoes as high as possible, squeezing your calf muscles at the top.
4. Hold briefly, then slowly lower back down.
5. Repeat. (Can be done with weights).`,
      imageHint: 'calf raise',
    },
    // Shoulders
    {
      name: 'Overhead Press (Barbell)',
      description: 'Compound exercise for shoulder strength and size.',
      muscleGroup: 'Shoulders',
      tutorial: `1. Stand with feet shoulder-width apart. Grip the barbell slightly wider than shoulder-width, palms facing forward. Rest the bar on your upper chest/front shoulders.
2. Engage your core and glutes. Press the barbell straight overhead until your arms are fully extended. Keep your head neutral or slightly back as the bar passes your face.
3. Slowly lower the bar back to the starting position with control.
4. Repeat.`,
      imageHint: 'overhead barbell press',
    },
    {
      name: 'Lateral Raises (Dumbbell)',
      description: 'Isolation exercise for the side deltoids.',
      muscleGroup: 'Shoulders',
      tutorial: `1. Stand or sit tall, holding a dumbbell in each hand at your sides, palms facing your body, slight bend in elbows.
2. Keeping the slight bend, raise the dumbbells out to your sides until your arms are parallel to the floor. Lead with your elbows.
3. Slowly lower the dumbbells back to the starting position with control.
4. Repeat.`,
      imageHint: 'dumbbell lateral raise',
    },
    {
      name: 'Front Raises (Dumbbell)',
      description: 'Isolation exercise for the front deltoids.',
      muscleGroup: 'Shoulders',
      tutorial: `1. Stand or sit tall, holding a dumbbell in each hand in front of your thighs, palms facing your body (or towards each other). Slight bend in elbows.
2. Raise one dumbbell straight up in front of you until it reaches shoulder height. Keep your arm mostly straight.
3. Slowly lower the dumbbell back down with control.
4. Repeat with the other arm, or raise both simultaneously.`,
      imageHint: 'dumbbell front raise',
    },
    {
      name: 'Face Pulls',
      description: 'Targets rear deltoids and upper back, improves posture.',
      muscleGroup: 'Shoulders',
      tutorial: `1. Set a cable machine pulley to head height and attach a rope handle.
2. Grab the ropes with an overhand grip (thumbs towards you) and step back until arms are extended.
3. Pull the ropes towards your face, aiming for your forehead/ears. Simultaneously rotate your shoulders externally (thumbs point back). Keep elbows high.
4. Squeeze your rear deltoids and upper back.
5. Slowly return to the starting position with control.
6. Repeat.`,
      imageHint: 'cable face pull',
    },
    // Arms (Biceps)
    {
      name: 'Bicep Curls (Barbell)',
      description: 'Classic exercise for building bicep mass.',
      muscleGroup: 'Arms',
      tutorial: `1. Stand tall with feet shoulder-width apart, holding a barbell with an underhand grip (palms facing up), hands shoulder-width apart.
2. Keep your elbows tucked close to your sides. Curl the barbell up towards your shoulders by contracting your biceps. Avoid swinging your body.
3. Squeeze your biceps at the top.
4. Slowly lower the barbell back to the starting position with control.
5. Repeat.`,
      imageHint: 'barbell bicep curl',
    },
    {
      name: 'Hammer Curls (Dumbbell)',
      description: 'Targets biceps and brachialis for thicker arms.',
      muscleGroup: 'Arms',
      tutorial: `1. Stand or sit tall, holding a dumbbell in each hand at your sides with palms facing your body (neutral grip).
2. Keep your elbows tucked close to your sides. Curl one dumbbell up towards your shoulder, maintaining the neutral grip.
3. Squeeze at the top.
4. Slowly lower the dumbbell back down.
5. Repeat with the other arm, or curl both simultaneously.`,
      imageHint: 'dumbbell hammer curl',
    },
    {
      name: 'Concentration Curls',
      description: 'Isolation exercise for peaking the biceps.',
      muscleGroup: 'Arms',
      tutorial: `1. Sit on a bench, lean forward slightly. Hold a dumbbell in one hand.
2. Brace the back of your upper arm (tricep area) against your inner thigh on the same side. Let the dumbbell hang down.
3. Curl the dumbbell up towards your shoulder, focusing purely on contracting the bicep. Keep your upper arm stationary.
4. Squeeze the bicep at the top.
5. Slowly lower the dumbbell back down with control.
6. Repeat for desired reps, then switch arms.`,
      imageHint: 'concentration curl',
    },
    // Arms (Triceps)
    {
      name: 'Close-Grip Bench Press',
      description: 'Compound exercise emphasizing the triceps.',
      muscleGroup: 'Arms',
      tutorial: `1. Lie flat on a bench like a standard bench press. Grip the barbell with hands closer than shoulder-width (index fingers on the smooth part of the bar is a common placement).
2. Unrack the bar and lower it slowly towards your lower chest/upper abs, keeping elbows tucked relatively close to your body.
3. Push the bar back up explosively, focusing on extending your triceps.
4. Repeat.`,
      imageHint: 'close grip bench press',
    },
    {
      name: 'Triceps Pushdowns (Cable)',
      description: 'Isolation exercise for the triceps.',
      muscleGroup: 'Arms',
      tutorial: `1. Stand facing a high cable pulley with a rope or bar attachment.
2. Grip the attachment with an overhand grip (palms down for bar) or neutral grip (palms facing each other for rope). Keep elbows tucked close to your sides.
3. Extend your arms downwards until they are fully straight, contracting your triceps. Keep your upper arms stationary.
4. Slowly return to the starting position, allowing your elbows to bend past 90 degrees.
5. Repeat.`,
      imageHint: 'cable triceps pushdown',
    },
    {
      name: 'Overhead Triceps Extension (Dumbbell)',
      description: 'Stretches and targets the long head of the triceps.',
      muscleGroup: 'Arms',
      tutorial: `1. Stand or sit tall. Hold one dumbbell with both hands, gripping the top end (cup the dumbbell head).
2. Extend the dumbbell straight overhead.
3. Keeping your elbows close to your head and pointing towards the ceiling, slowly lower the dumbbell behind your head by bending your elbows. Feel the stretch in your triceps.
4. Extend your arms back to the starting position by contracting your triceps.
5. Repeat.`,
      imageHint: 'dumbbell overhead triceps extension',
    },
    // Core
    {
      name: 'Plank',
      description: 'Core stability exercise.',
      muscleGroup: 'Core',
      tutorial: `1. Start in a position similar to a push-up, but rest on your forearms instead of your hands. Elbows should be directly under your shoulders.
2. Clasp hands together or keep palms flat on the floor.
3. Extend your legs back, resting on your toes. Your body should form a straight line from head to heels.
4. Engage your core, glutes, and quads. Avoid letting your hips sag or rise too high.
5. Hold the position for the desired duration. Breathe normally.`,
      imageHint: 'plank hold',
    },
    {
      name: 'Crunches',
      description: 'Targets the upper abdominal muscles.',
      muscleGroup: 'Core',
      tutorial: `1. Lie on your back with knees bent and feet flat on the floor (or heels resting on a bench). Place hands lightly behind your head (don't pull on neck) or across your chest.
2. Engage your abs and lift your head, neck, and shoulders off the floor, curling your torso towards your knees. Focus on contracting your abs.
3. Hold briefly at the top.
4. Slowly lower back down with control.
5. Repeat.`,
      imageHint: 'crunch exercise',
    },
    {
      name: 'Leg Raises',
      description: 'Targets the lower abdominal muscles.',
      muscleGroup: 'Core',
      tutorial: `1. Lie flat on your back with legs straight (or slightly bent if needed). Place hands under your lower back/glutes for support or by your sides.
2. Keeping your legs straight (or slightly bent), raise them towards the ceiling until they are perpendicular to the floor (or as high as comfortable). Engage your lower abs.
3. Slowly lower your legs back down towards the floor, stopping just before they touch. Maintain control and keep your lower back pressed into the floor.
4. Repeat.`,
      imageHint: 'leg raise exercise',
    },
    {
      name: 'Russian Twists',
      description: 'Targets the oblique muscles.',
      muscleGroup: 'Core',
      tutorial: `1. Sit on the floor with knees bent and feet flat (or lifted off the floor for more challenge). Lean back slightly, keeping your back straight, to engage your core (V-sit position).
2. Clasp your hands together in front of your chest (or hold a weight).
3. Twist your torso from side to side, touching your hands (or the weight) to the floor on each side. Keep your hips relatively stable.
4. Rotate using your oblique muscles.
5. Repeat for the desired number of repetitions (counting each side twist as one or both sides as one).`,
      imageHint: 'russian twist exercise',
    },
  ];

  return exercises;
}

    