#!/bin/bash

echo "🔍 Checking verification codes for admin user..."
echo ""

# Get current verification code status
result=$(npx astro db shell --query "
SELECT 
  verification_code,
  verification_code_expires,
  datetime('now') as current_time
FROM SurveyUser 
WHERE username = 'admin'
" 2>/dev/null)

# Extract the verification code from the result
code=$(echo "$result" | grep -o "verification_code: '[^']*'" | sed "s/verification_code: '//g" | sed "s/'//g")
expires=$(echo "$result" | grep -o "verification_code_expires: '[^']*'" | sed "s/verification_code_expires: '//g" | sed "s/'//g")

if [ "$code" != "null" ] && [ -n "$code" ]; then
    echo "✅ Found verification code!"
    echo ""
    echo "� CODE: $code"
    echo "⏰ EXPIRES: $expires"
    echo ""
    echo "Copy this code: $code"
else
    echo "❌ No current verification code found."
    echo ""
    echo "💡 To generate a new code:"
    echo "   1. Go to: http://localhost:4325/admin/login"
    echo "   2. Login with: admin / admin" 
    echo "   3. Run this script again to see the code"
    echo ""
    echo "   Or try the simple test: http://localhost:4325/admin/simple-login-test"
fi

echo ""
echo "─────────────────────────────────────"
