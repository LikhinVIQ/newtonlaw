import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

const initializeLessons = async () => {
  try {
    console.log('Initializing local database with lesson data...');
    
    // Check if lessons already exist
    const existingLessons = await pool.query('SELECT COUNT(*) FROM lessons');
    if (parseInt(existingLessons.rows[0].count) > 0) {
      console.log('Lessons already exist in database. Skipping initialization.');
      return;
    }

    // Insert Newton's Laws lessons
    const insertQuery = `
      INSERT INTO lessons (title, law_number, theory, examples, completed) VALUES 
      (
        'Newton''s First Law of Motion',
        1,
        'An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force. This is also known as the Law of Inertia.',
        '[
          {
            "title": "Car Crash",
            "description": "When a car suddenly stops, passengers continue moving forward due to inertia until the seatbelt applies a force to stop them."
          },
          {
            "title": "Hockey Puck", 
            "description": "A hockey puck glides across the ice and continues moving until friction and other forces gradually slow it down."
          },
          {
            "title": "Tablecloth Trick",
            "description": "Pulling a tablecloth quickly from under dishes leaves the dishes in place due to their inertia."
          }
        ]',
        true
      ),
      (
        'Newton''s Second Law of Motion',
        2,
        'The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass. This is expressed as F = ma (Force equals mass times acceleration).',
        '[
          {
            "title": "Pushing a Shopping Cart",
            "description": "The harder you push a shopping cart (more force), the faster it accelerates. A full cart (more mass) requires more force to achieve the same acceleration."
          },
          {
            "title": "Baseball Pitching",
            "description": "A pitcher applies force to accelerate the baseball. The same force applied to a bowling ball would produce much less acceleration due to its greater mass."
          },
          {
            "title": "Car Engine",
            "description": "A car''s engine provides force to accelerate the vehicle. More powerful engines can accelerate heavier cars or accelerate lighter cars more quickly."
          }
        ]',
        true
      ),
      (
        'Newton''s Third Law of Motion',
        3,
        'For every action, there is an equal and opposite reaction. This means that forces always come in pairs - when object A exerts a force on object B, object B simultaneously exerts an equal and opposite force on object A.',
        '[
          {
            "title": "Rocket Propulsion",
            "description": "Hot gases are expelled downward from the rocket engines (action), which pushes the rocket upward with equal force (reaction)."
          },
          {
            "title": "Walking",
            "description": "You push backward against the ground with your foot (action), and the ground pushes you forward with equal force (reaction)."
          },
          {
            "title": "Swimming", 
            "description": "A swimmer pushes water backward with their arms and legs (action), and the water pushes the swimmer forward (reaction)."
          }
        ]',
        false
      )
    `;

    await pool.query(insertQuery);
    console.log('Successfully initialized database with Newton\'s Laws lessons!');
    
    // Verify insertion
    const result = await pool.query('SELECT id, title, law_number FROM lessons ORDER BY law_number');
    console.log('Lessons in database:');
    result.rows.forEach(lesson => {
      console.log(`  ${lesson.law_number}. ${lesson.title} (ID: ${lesson.id})`);
    });
    
  } catch (error) {
    console.error('Error initializing database:', error.message);
  } finally {
    await pool.end();
  }
};

initializeLessons();