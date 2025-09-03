#!/usr/bin/env node

// Simple script to show current verification codes using astro db shell
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function showVerificationCode() {
  console.log("🔍 Checking for current verification codes...\n");
  
  const query = `
    SELECT 
      username, 
      email, 
      verification_code, 
      verification_code_expires, 
      two_factor_method 
    FROM SurveyUser 
    WHERE two_factor_enabled = 1 
      AND verification_code IS NOT NULL 
      AND verification_code_expires > datetime('now')
  `;
  
  const astroDb = spawn('npx', ['astro', 'db', 'shell', '--query', query], {
    cwd: __dirname,
    stdio: ['inherit', 'pipe', 'pipe']
  });
  
  let output = '';
  
  astroDb.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  astroDb.stderr.on('data', (data) => {
    console.error('Error:', data.toString());
  });
  
  astroDb.on('close', (code) => {
    if (code === 0 && output.trim()) {
      try {
        // Parse the ResultSetImpl output
        const result = eval('(' + output.trim() + ')');
        
        if (result.rows && result.rows.length > 0) {
          console.log("✅ Active verification codes:\n");
          
          result.rows.forEach(row => {
            const expiresAt = new Date(row.verification_code_expires);
            const now = new Date();
            const timeLeft = Math.round((expiresAt.getTime() - now.getTime()) / 1000 / 60);
            
            console.log(`📧 USER: ${row.username}`);
            console.log(`🔑 CODE: ${row.verification_code}`);
            console.log(`⏰ EXPIRES: ${timeLeft} minutes remaining`);
            console.log(`📮 METHOD: ${row.two_factor_method} (${row.email})`);
            console.log(`─────────────────────────────────────`);
          });
        } else {
          console.log("❌ No active verification codes found.");
          console.log("💡 Try logging in to generate a new code.");
        }
      } catch (error) {
        console.log("❌ No active verification codes found.");
        console.log("💡 Try logging in to generate a new code.");
      }
    } else {
      console.log("❌ No active verification codes found.");
      console.log("💡 Try logging in to generate a new code.");
    }
  });
}

showVerificationCode();
