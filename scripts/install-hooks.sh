#!/bin/sh
# Installs the pre-commit hook for the digital garden.
# Run once per device after cloning: bash scripts/install-hooks.sh

HOOK=".git/hooks/pre-commit"

cat > "$HOOK" << 'EOF'
#!/bin/sh
npm run validate
if [ $? -ne 0 ]; then
  echo ""
  echo "Commit blocked: fix the validation errors above before committing."
  exit 1
fi
EOF

chmod +x "$HOOK"
echo "Pre-commit hook installed at $HOOK"
